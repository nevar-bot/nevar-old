const BaseCommand = require('@structures/BaseCommand');
const moment = require("moment");
const { SlashCommandBuilder } = require("discord.js");
class Mutelist extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "mutelist",
            description: "Zeigt eine Liste aller gemuteten Mitglieder an",

            memberPermissions: ["ManageRoles"],

            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.showMuteList(data);
    }

    async showMuteList(data){
        let mutedUsers = [];

        for(let memberData of this.client.databaseCache.mutedUsers) {
            if (memberData[1].guildID === this.interaction.guild.id) {
                const victimData = memberData[1];
                const member = await this.interaction.guild.resolveMember(victimData.id);
                const text =
                    member.user.tag + "\n" +
                    this.client.emotes.arrow + "Grund: " + victimData.muted.reason + "\n" +
                    this.client.emotes.arrow + "Moderator: " + victimData.muted.moderator.name + "\n" +
                    this.client.emotes.arrow + "Dauer: " + this.client.utils.getRelativeTime(Date.now() - victimData.muted.duration) + "\n" +
                    this.client.emotes.arrow + "Gemutet am: " + moment(victimData.muted.mutedAt).format("DD.MM.YYYY, HH:mm") + "\n" +
                    this.client.emotes.arrow + "Gemutet bis: " + moment(victimData.muted.mutedUntil).format("DD.MM.YYYY, HH:mm") + "\n";
                mutedUsers.push(text);
            }
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 3, mutedUsers, "Gemutete Mitglieder", "Es sind keine Mitglieder gemutet", "timeout");
    }
}
module.exports = Mutelist;
