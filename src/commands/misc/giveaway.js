const BaseCommand = require('@structures/BaseCommand');
const { ChannelType, SlashCommandBuilder } = require('discord.js');
const ms = require("enhanced-ms")("de")

class Giveaway extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "giveaway",
            description: "Verwaltet die Giveaways auf dem Server",

            memberPermissions: ["ManageGuild"],
            cooldown: 2000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addSubcommand(subcommand => subcommand
                        .setName("start")
                        .setDescription("Startet ein neue Gewinnspiel")
                        .addChannelOption(option => option
                            .setName("channel")
                            .setDescription("Wähle, in welchem Channel das Gewinnspiel gestartet werden soll")
                            .setRequired(true)
                            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                        )
                        .addStringOption(option => option
                            .setName("gewinn")
                            .setDescription("Gib den Gewinn an")
                            .setMaxLength(256)
                            .setRequired(true)
                        )
                        .addStringOption(option => option
                            .setName("dauer")
                            .setDescription("Gib die Dauer an (z.B. 1h, 1d, 1w, 1h 30m)")
                            .setRequired(true)
                        )
                        .addIntegerOption(option => option
                            .setName("gewinner")
                            .setDescription("Gib an wieviele Gewinner es geben soll")
                            .setMinValue(1)
                            .setMaxValue(10)
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(subcommand => subcommand
                        .setName("end")
                        .setDescription("Beendet ein laufendes Gewinnspiel")
                        .addStringOption(option => option
                            .setName("id")
                            .setDescription("Gib die ID der Nachricht des Gewinnspiels an")
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(subcommand => subcommand
                        .setName("reroll")
                        .setDescription("Lost neue Gewinner für ein beendetes Gewinnspiel aus")
                        .addStringOption(option => option
                            .setName("id")
                            .setDescription("Gib die ID der Nachricht des beendeten Gewinnspiels an")
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(subcommand => subcommand
                        .setName("delete")
                        .setDescription("Löscht ein Gewinnspiel")
                        .addStringOption(option => option
                            .setName("id")
                            .setDescription("Gib die ID der Nachricht des Gewinnspiels an")
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(subcommand => subcommand
                        .setName("list")
                        .setDescription("Zeigt alle laufenden Gewinnspiele an")
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        const subcommand = interaction.options.getSubcommand();

        switch(subcommand){
            case "start":
                await this.start();
                break;
            case "end":
                await this.end();
                break;
            case "reroll":
                await this.reroll();
                break;
            case "delete":
                await this.delete();
                break;
            case "list":
                await this.list();
                break;
        }
    };

    async start(){
        const channel = this.interaction.options.getChannel("channel");
        const win = this.interaction.options.getString("gewinn");
        const duration = this.interaction.options.getString("dauer");
        const winner = this.interaction.options.getInteger("gewinner");

        if(!ms(duration)){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst eine gültige Dauer angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] })
        }

        this.client.giveawayManager.start(channel, {
            duration: ms(duration),
            winnerCount: winner,
            prize: win,
            hostedBy: this.interaction.user,

            thumbnail: this.client.user.displayAvatarURL(),
            messages: {
                giveaway:
                    "🎉🎉 **GEWINNSPIEL** 🎉🎉",
                giveawayEnded:
                    "🎉🎉 **GEWINNSPIEL BEENDET** 🎉🎉",
                title:
                    "Neues Gewinnspiel!",
                inviteToParticipate:
                    this.client.emotes.gift + "Verlost wird **{this.prize}!**\n\n" +
                    this.client.emotes.arrow + "Um teilzunehmen, reagiere mit " + this.client.emotes.tada + "!",
                winMessage: {
                    content:
                        this.client.emotes.tada + " Herzlichen Glückwunsch, {winners}! {this.winnerCount > 1 ? 'Ihr habt' : 'Du hast'} **{this.prize}** gewonnen!",
                    replyToGiveaway: true,
                },
                drawing:
                    this.client.emotes.reminder + " Endet {timestamp}",
                embedFooter:
                    "{this.winnerCount} Gewinner",
                noWinner:
                    this.client.emotes.gift + " Verlost wird **{this.prize}!**\n\n" +
                    this.client.emotes.arrow + "Teilnahmen sind **nicht** mehr möglich!\n" +
                    this.client.emotes.reminder + "Endet <t:{Math.round(this.endAt / 1000)}:R>\n\n" +
                    this.client.emotes.users + " Da es keine Teilnehmer gab, gibt es keine Gewinner!",
                winners:
                    this.client.emotes.gift + " Verlost wird **{this.prize}!**\n\n" +
                    this.client.emotes.arrow + " Teilnahmen sind **nicht** mehr möglich!\n" +
                    this.client.emotes.reminder + " Endet <t:{Math.round(this.endAt / 1000)}:R>\n\n" +
                    this.client.emotes.users + " Gewinner:",
                endedAt:
                    "Beendet",
                hostedBy:
                    "\n" + this.client.emotes.user + " Veranstaltet durch: {this.hostedBy}\n" +
                    this.client.emotes.users + " Teilnehmer: {this.entrantIds.length}",
            }
        });

        const successEmbed = this.client.createEmbed("Das Gewinnspiel wurde gestartet.", "success", "success");
        return this.interaction.followUp({ embeds: [successEmbed] })
    }

    async end(){
        const id = this.interaction.options.getString("id");
        this.client.giveawayManager
            .end(id)
            .then(async () => {
                const successEmbed = this.client.createEmbed("Das Gewinnspiel wurde beendet.", "success", "success");
                return this.interaction.followUp({ embeds: [successEmbed] })
            })
            .catch(async () => {
                const errorEmbed = this.client.createEmbed("Mit der ID habe ich kein Gewinnspiel gefunden.", "error", "error");
                return this.interaction.followUp({ embeds: [errorEmbed] })
            });
    }

    async reroll(){
        const id = this.interaction.options.getString("id");
        this.client.giveawayManager
            .reroll(id, {
                messages: {
                    congrat: {
                        content: this.client.emotes.tada + " Herzlichen Glückwunsch, {winners}! {this.winnerCount > 1 ? 'Ihr habt' : 'Du hast'} **{this.prize}** gewonnen!",
                        replyToGiveaway: true
                    },
                    error: this.client.emotes.error + " Da es keine weiteren gültigen Teilnehmer gab, gibt es keine Gewinner!",
                }
            })
            .then(async () => {
                const successEmbed = this.client.createEmbed("Das Gewinnspiel wurde neu ausgelost.", "success", "success");
                return this.interaction.followUp({ embeds: [successEmbed] })
            })
            .catch(async () => {
                const errorEmbed = this.client.createEmbed("Mit der ID habe ich kein Gewinnspiel gefunden.", "error", "error");
                return this.interaction.followUp({ embeds: [errorEmbed] })
            })
    }

    async delete(){
        const id = this.interaction.options.getString("id");
        this.client.giveawayManager
            .delete(id)
            .then(async () => {
                const successEmbed = this.client.createEmbed("Das Gewinnspiel wurde gelöscht.", "success", "success");
                return this.interaction.followUp({ embeds: [successEmbed] })
            })
            .catch(async () => {
                const errorEmbed = this.client.createEmbed("Mit der ID habe ich kein Gewinnspiel gefunden.", "error", "error");
                return this.interaction.followUp({ embeds: [errorEmbed] })
            });
    }

    async list(){
        const guildGiveaways = this.client.giveawayManager.giveaways.filter((g) => g.guildId === this.interaction.guild.id && !g.ended);

        const giveaways = [];

        for(let giveaway of guildGiveaways){
            const prize = giveaway.prize;
            const channel = await this.interaction.guild.channels.fetch(giveaway.channelId).catch(() => {});
            if(!channel) continue;
            const winnerCount = giveaway.winnerCount;
            const hostedBy = giveaway.hostedBy;
            const startedAt = giveaway.startAt;
            const endAt = giveaway.endAt;

            const text =
                 " **" + prize + "**\n" +
                this.client.emotes.arrow + "Channel: " + channel.toString() + "\n" +
                this.client.emotes.arrow + "Gewinner: " + winnerCount + "\n" +
                this.client.emotes.arrow + "Veranstaltet durch: " + hostedBy + "\n" +
                this.client.emotes.arrow + "Gestartet <t:" + Math.round(startedAt / 1000) + ":R>\n" +
                this.client.emotes.arrow + "Endet <t:" + Math.round(endAt / 1000) + ":R>\n\n";
            giveaways.push(text);
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 3, giveaways, "Gewinnspiele", "Es sind keine Gewinnspiele vorhanden", "gift");
    }
}
module.exports = Giveaway;