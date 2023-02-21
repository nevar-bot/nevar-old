const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require("discord.js");

class Afk extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "afk",
            description: "Setzt deinen AFK Status",

            cooldown: 2000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                        .addStringOption(option => option
                            .setName("grund")
                            .setDescription("Warum bist du AFK?")
                            .setRequired(false)
                        )
            }
        });
    }

    static interaction;

    async dispatch(interaction, data) {
        this.interaction = interaction;
        await this.setAfk(interaction.member, interaction.options.getString("grund"), data);
    }

    async setAfk(member, reason, data) {
        if(data.user.afk.state){
            const afkSince = data.user.afk.since;
            const reason = data.user.afk.reason || "Kein Grund angegeben";

            const relativeTime = this.client.utils.getRelativeTime(afkSince);
            const welcomeBackEmbed = this.client.generateEmbed("Willkommen zurück! Du warst AFK für {0}", "reminder", "normal", relativeTime + " (" + reason + ")");

            data.user.afk = {
                state: false,
                reason: null,
                since: null
            }
            data.user.markModified("afk");
            await data.user.save();
            return this.interaction.followUp({ embeds: [welcomeBackEmbed] });
        }

        data.user.afk = {
            state: true,
            reason: reason,
            since: Date.now()
        }
        data.user.markModified("afk");
        await data.user.save();

        const seeYouLaterEmbed = this.client.generateEmbed("Bis später! Du bist jetzt AFK: {0}", "reminder", "normal", reason || "Kein Grund angegeben");
        return this.interaction.followUp({ embeds: [seeYouLaterEmbed] });
    }
}
module.exports = Afk;
