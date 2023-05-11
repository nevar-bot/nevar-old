const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const ms = require("enhanced-ms")("de");
const moment = require("moment");

class Ban extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "ban",
            description: "Bannt ein Mitglied für eine bestimmte Zeit",

            memberPermissions: ["BanMembers"],
            botPermissions: ["BanMembers"],

            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addUserOption(option => option
                        .setName("mitglied")
                        .setDescription("Wähle ein Mitglied")
                        .setRequired(true)
                    )
                    .addStringOption(option => option
                        .setName("grund")
                        .setDescription("Gib einen Grund an")
                        .setRequired(false)
                    )
                    .addStringOption(option => option
                        .setName("dauer")
                        .setDescription("Gib eine Dauer an (bspw. 1h, 1d, 1h 30m, etc.)")
                        .setRequired(false)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.ban(interaction.options.getUser("mitglied"), interaction.options.getString("grund"), interaction.options.getString("dauer"), data);
    }

    async ban(member, reason, duration, data){
        member = await this.interaction.guild.resolveMember(member.id);
        if(!member){
            const noMemberEmbed = this.client.createEmbed("Du musst ein Mitglied angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [noMemberEmbed] });
        }

        if(member.user.id === this.interaction.user.id){
            const selfEmbed = this.client.createEmbed("Du kannst dich nicht selbst bannen.", "error", "error");
            return this.interaction.followUp({ embeds: [selfEmbed] });
        }

        if(member.user.id === this.client.user.id){
            const meEmbed = this.client.createEmbed("Ich kann mich nicht selbst bannen.", "error", "error");
            return this.interaction.followUp({ embeds: [meEmbed] });
        }

        if(member.roles.highest.position >= this.interaction.member.roles.highest.position){
            const higherRoleEmbed = this.client.createEmbed("Du kannst keine Mitglieder bannen, die eine höhere Rolle haben als du.", "error", "error");
            return this.interaction.followUp({ embeds: [higherRoleEmbed] });
        }

        if(!member.bannable){
            const cantBanEmbed = this.client.createEmbed("Ich kann dieses Mitglied nicht bannen.", "error", "error");
            return this.interaction.followUp({ embeds: [cantBanEmbed] });
        }

        if(duration && !ms(duration)){
            const invalidDurationEmbed = this.client.createEmbed("Du hast eine ungültige Dauer angegeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidDurationEmbed] });
        }

        const ban = {
            victim: member,
            reason: reason || "Kein Grund angegeben",
            duration: duration ? ms(duration) : 200 * 60 * 60 * 24 * 365 * 1000,
        };

        let relativeTime = this.client.utils.getRelativeTime(Date.now() - ban.duration);
        if(ban.duration === 200 * 60 * 60 * 24 * 365 * 1000){
            relativeTime = "Permanent";
        }
        let unbanDate = moment(Date.now() + ban.duration).format("DD.MM.YYYY, HH:mm");
        if(ban.duration === 200 * 60 * 60 * 24 * 365 * 1000){
            unbanDate = "/";
        }

        const areYouSureEmbed = this.client.createEmbed("Bist du dir sicher, dass du {0} bannen möchtest?", "arrow", "warning", member.user.tag);
        const buttonYes = this.client.createButton("confirm", "Ja", "Secondary", "success");
        const buttonNo = this.client.createButton("decline", "Nein", "Secondary", "error");
        const buttonRow = this.client.createMessageComponentsRow(buttonYes, buttonNo);

        const confirmationAskMessage = await this.interaction.followUp({ embeds: [areYouSureEmbed], components: [buttonRow] });

        const confirmationButtonCollector = confirmationAskMessage.createMessageComponentCollector({ filter: (i) => i.user.id === this.interaction.user.id, time: 1000 * 60 * 5, max: 1 });
        confirmationButtonCollector.on("collect", async (clicked) => {
            const confirmation = clicked.customId;

            switch(confirmation){
                case "confirm":
                    const privateText =
                        "Du wurdest auf {0} gebannt.\n\n" +
                        this.client.emotes.arrow + " Grund: " + ban.reason + "\n" +
                        this.client.emotes.arrow + " Dauer: " + relativeTime + "\n" +
                        this.client.emotes.arrow + " Moderator: " + this.interaction.user.tag + "\n" +
                        this.client.emotes.arrow + " Unban am: " + unbanDate;
                    const privateBanEmbed = this.client.createEmbed(privateText, "timeout", "error", this.interaction.guild.name);
                    const privateMessage = await ban.victim.send({ embeds: [privateBanEmbed] }).catch(() => {});
                    try {
                        await ban.victim.ban({ reason: "BAN - Dauer: " + relativeTime + " | Grund: " + ban.reason + " | Moderator: " + this.interaction.user.tag + " | Unban am: " + unbanDate });
                        const victimData = await this.client.findOrCreateMember({ id: ban.victim.user.id, guildID: this.interaction.guild.id });

                        victimData.banned = {
                            state: true,
                            reason: ban.reason,
                            moderator: {
                                name: this.interaction.user.tag,
                                id: this.interaction.user.id
                            },
                            duration: ban.duration,
                            bannedAt: Date.now(),
                            bannedUntil: Date.now() + ban.duration
                        };
                        victimData.markModified("banned");
                        await victimData.save();
                        this.client.databaseCache.bannedUsers.set(ban.victim.user.id + this.interaction.guild.id, victimData);

                        const publicText =
                            "{0} wurde gebannt.\n\n" +
                            this.client.emotes.arrow + " Grund: " + ban.reason + "\n" +
                            this.client.emotes.arrow + " Dauer: " + relativeTime + "\n" +
                            this.client.emotes.arrow + " Moderator: " + this.interaction.user.tag + "\n" +
                            this.client.emotes.arrow + " Unban am: " + unbanDate;
                        const publicBanEmbed = this.client.createEmbed(publicText, "timeout", "error", ban.victim.user.tag);
                        publicBanEmbed.setImage("https://media4.giphy.com/media/H99r2HtnYs492/giphy.gif");
                        await clicked.update({ embeds: [publicBanEmbed], components: [] });
                    }catch(exc) {
                        console.log(exc);
                        privateMessage.delete().catch(() => {});
                        const cantBanEmbed = this.client.createEmbed("Ich konnte {0} nicht bannen.", "error", "error", ban.victim.user.tag);
                        await clicked.update({embeds: [cantBanEmbed], components: []});
                    }
                    break;
                case "decline":
                    const declineEmbed = this.client.createEmbed("{0} wurde nicht gebannt.", "error", "error", ban.victim.user.tag);
                    await clicked.update({ embeds: [declineEmbed], components: [] });
                    break;
            }
        });
    }
}

module.exports = Ban;
