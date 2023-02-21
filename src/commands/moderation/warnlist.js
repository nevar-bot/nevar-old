const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require("discord.js");
const moment = require("moment");

class Warnlist extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "warnlist",
            description: "Listet alle Verwarnungen eines Mitgliedes auf",

            memberPermissions: ["KickMembers"],
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
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.listWarnings(interaction.options.getUser("mitglied"));
    }

    async listWarnings(user) {
        const member = await this.interaction.guild.resolveMember(user.id);
        if(!member){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst ein Mitglied angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        const targetData = await this.client.findOrCreateMember({ id: member.user.id, guildID: this.interaction.guild.id });

        const warnList = [];
        const warnings = [... targetData.warnings.list];
        const warnCount = targetData.warnings.count;

        let indicator = 0;
        for(let warn of warnings){
            indicator++;
            const text =
                " **Warn " + indicator + "**\n" +
                this.client.emotes.arrow + " Grund: " + warn.reason + "\n" +
                this.client.emotes.arrow + " Moderator: " + warn.moderator + "\n" +
                this.client.emotes.arrow + " Verwarnt am: " + moment(warn.date).format("DD.MM.YYYY, HH:mm") + "\n";
            warnList.push(text);
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, warnList, "Warns von " + member.user.tag + " (" + warnCount + ")", member.user.tag + " hat keine Verwarnungen", "ban")
    }
}

module.exports = Warnlist;
