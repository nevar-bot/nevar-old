const BaseCommand = require('@structures/BaseCommand');
const moment = require("moment");
const mongoose = require('mongoose')

class Searchserver extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "searchserver",
            description: "Zeigt Informationen über einen Server an",

            cooldown: 3000,
            staffOnly: true,
            dirname: __dirname,

            slashCommand: {
                addCommand: false
            }
        });
    }

    static message;
    async dispatch(message, args, data) {
        this.message = message;
        await this.searchServer(args[0]);
    }

    async searchServer(id){
        if(!id || !this.client.guilds.cache.get(id)){
            const notFoundEmbed = this.client.generateEmbed("Der Server wurde nicht gefunden.", "error", "error");
            return this.message.reply({ embeds: [notFoundEmbed] });
        }

        const guild = this.client.guilds.cache.get(id);

        const owner = await guild.fetchOwner();
        const memberCount = guild.memberCount;
        const botCount = guild.members.cache.filter((m) => m.user.bot === true).size;
        const humanCount = memberCount - botCount;
        const botPercentage = Math.round((botCount / memberCount) * 100);
        const humanPercentage = Math.round((humanCount / memberCount) * 100);

        const createdDate = moment(guild.createdTimestamp).format("DD.MM.YYYY HH:mm");
        const createdDiff = this.client.utils.getRelativeTime(guild.createdTimestamp);
        const invitedDate = moment(guild.joinedAt).format("DD.MM.YYYY HH:mm");
        const invitedDiff = this.client.utils.getRelativeTime(guild.joinedTimestamp);
        const executedCommands = (await (await mongoose.connection.db.collection("logs")).find({ "guild.id": guild.id }).toArray()).length;

        const text =
            this.client.emotes.crown + " Eigentümer: **" + owner.user.tag + "**\n\n" +
            this.client.emotes.users + " Mitglieder: **" + this.client.format(memberCount) + "**\n" +
            this.client.emotes.bot + " davon Bots: **" + this.client.format(botCount) + " (" + botPercentage + "%)**\n" +
            this.client.emotes.user + " davon Menschen: **" + this.client.format(humanCount) + " (" + humanPercentage + "%)**\n\n" +
            this.client.emotes.calendar + " Erstellt am: **" + createdDate + "**\n" +
            this.client.emotes.reminder + " Erstellt vor: **" + createdDiff + "**\n\n" +
            this.client.emotes.calendar + " Eingeladen am: **" + invitedDate + "**\n" +
            this.client.emotes.reminder + " Eingeladen vor: **" + invitedDiff + "**\n\n" +
            this.client.emotes.slashcommand + " Befehle ausgeführt: **" + this.client.format(executedCommands) + "**";

        const searchServerEmbed = this.client.generateEmbed(text, null, "normal");
        searchServerEmbed.setTitle(this.client.emotes.information + " Informationen zu " + guild.name);
        searchServerEmbed.setThumbnail(guild.iconURL({ dynamic: true }));

        return this.message.reply({ embeds: [searchServerEmbed] });
    }
}

module.exports = Searchserver;
