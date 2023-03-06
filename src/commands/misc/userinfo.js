const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder} = require('discord.js');
const moment = require('moment');

class Userinfo extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "userinfo",
            description: "Zeigt Informationen über einen Nutzer an",

            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addUserOption(option => option
                            .setName("mitglied")
                            .setDescription("Wähle ein Mitglied")
                            .setRequired(false)
                        )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;
        await this.showUserInfo(interaction.options.getUser("mitglied"));
    }

    async showUserInfo(member){
        if(member){
            member = await this.interaction.guild.members.fetch(member.id);
        }else{
            member = this.interaction.member;
        }

        const data = await this.client.findOrCreateUser({ id: member.user.id });

        const name = member.user.tag;
        const createdAt = moment(member.user.createdTimestamp).format("DD.MM.YYYY HH:mm");
        const createdDiff = this.client.utils.getRelativeTime(member.user.createdTimestamp);
        const nickname = member.nickname ? member.nickname : member.user.username;
        const joinedAt = moment(member.joinedTimestamp).format("DD.MM.YYYY HH:mm");
        const joinedDiff = this.client.utils.getRelativeTime(member.joinedTimestamp);
        const bot = member.user.bot ? "Ja" : "Nein";
        const userFlags = (await member.user.fetchFlags()).toArray();

        const flags = {
            "ActiveDeveloper": "Aktiver Entwickler",
            "BugHunterLevel1": "Bug Hunter Level 1",
            "BugHunterLevel2": "Bug Hunter Level 2",
            "CertifiedModerator": "Zertifizierter Moderator",
            "HypeSquadOnlineHouse1": "Bravery-Hypesquad",
            "HypeSquadOnlineHouse2": "Brilliance-Hypesquad",
            "HypeSquadOnlineHouse3": "Balance-Hypesquad",
            "HypeSquadEvents": "Hypesquad-Events",
            "Partner": "Eigentümer eines Partner-Servers",
            "PremiumEarlySupporter": "Supporter der ersten Stunde",
            "Staff": "Discord-Mitarbeiter",
            "VerifiedBot": "Verifizierter Bot",
            "VerifiedDeveloper": "Verifizierter Bot-Entwickler der ersten Stunde"
        }
        // Badges
        let badges = [];

        // Custom Badges
        // Nevar staff
        if(data.staff.state || this.client.config.general["OWNER_IDS"].includes(member.user.id)) badges.push(this.client.emotes.flags.Staff + " " + this.client.user.username + "-Staff");
        // Nevar partner
        if(data.partner.state) badges.push(this.client.emotes.flags.Partner + " " + this.client.user.username + "-Partner");
        // Nevar Bughunter
        if(data.bughunter.state) badges.push(this.client.emotes.flags.BugHunterLevel1 + " " + this.client.user.username + "-Bughunter");

        // Discord badges
        for(let flag of userFlags) {
            if (flags[flag]) badges.push(this.client.emotes.flags[flag] + " " + flags[flag]);
        }

        if(badges.length === 0) badges = [this.client.emotes.arrow + " Keine Badges vorhanden"];

        const text =
            this.client.emotes.user + " Name: **" + name + "**\n\n" +
            this.client.emotes.calendar + " Account erstellt am: **" + createdAt + "**\n" +
            this.client.emotes.reminder + " Account erstellt vor: **" + createdDiff + "**\n\n" +
            this.client.emotes.calendar + " Server betreten am: **" + joinedAt + "**\n" +
            this.client.emotes.reminder + " Server betreten vor: **" + joinedDiff + "**\n\n" +
            this.client.emotes.edit + " Nickname: **" + nickname + "**\n" +
            this.client.emotes.bot + " Bot: **" + bot + "**\n\n" +
            this.client.emotes.shine + " Badges: **\n" + badges.join("\n") + "**";


        const searchServerEmbed = this.client.generateEmbed(text, null, "normal");
        searchServerEmbed.setTitle(this.client.emotes.information + " Informationen zu " + member.user.username);
        searchServerEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

        return this.interaction.followUp({ embeds: [searchServerEmbed] });

    }
}
module.exports = Userinfo;
