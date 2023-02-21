const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const moment = require("moment");

class Banlist extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "banlist",
            description: "Zeigt eine Liste aller gebannten Mitglieder an",

            memberPermissions: ["BanMembers"],
            botPermissions: ['BanMembers'],

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

        await this.showBanList();

    }

    async showBanList(){
        let bannedUsers = [];
        const bans = await this.interaction.guild.bans.fetch().catch(() => {});
        for(let ban of bans){
            const memberData = await this.client.findOrCreateMember({ id: ban[1].user.id, guildID: this.interaction.guild.id });
            if(memberData.banned.state){
                // Mit Nevar gebannt
                const duration = memberData.banned.duration === 200 * 60 * 60 * 24 * 365 * 1000 ? "Permanent" : this.client.utils.getRelativeTime(Date.now() - memberData.banned.duration);
                const bannedUntil = memberData.banned.duration === 200 * 60 * 60 * 24 * 365 * 1000 ? "/" : moment(memberData.banned.bannedUntil).format("DD.MM.YYYY, HH:mm");
                const text =
                    "**" + ban[1].user.tag + "**\n" +
                    this.client.emotes.arrow + " Grund: " + memberData.banned.reason + "\n" +
                    this.client.emotes.arrow + " Moderator: " + memberData.banned.moderator.name + "\n" +
                    this.client.emotes.arrow + " Dauer: " + duration + "\n" +
                    this.client.emotes.arrow + " Gebannt am: " + moment(memberData.banned.bannedAt).format("DD.MM.YYYY, HH:mm") + "\n" +
                    this.client.emotes.arrow + " Gebannt bis: " + bannedUntil + "\n";
                bannedUsers.push(text)
            }else{
                // Nicht mit Nevar gebannt
                const text =
                    "**" + ban[1].user.tag + "**\n" +
                    this.client.emotes.arrow + " Grund: " + ban[1].reason + "\n";
                bannedUsers.push(text)
            }
        }
        await this.client.utils.sendPaginatedEmbed(this.interaction, 3, bannedUsers, "Gebannte Nutzer", "Es sind keine Nutzer gebannt", "timeout");
    }
}
module.exports = Banlist;
