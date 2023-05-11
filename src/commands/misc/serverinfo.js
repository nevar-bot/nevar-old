const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, ChannelType } = require("discord.js");
const moment = require('moment');

class Serverinfo extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "serverinfo",
            description: "Zeigt allgemeine Informationen über den Server an",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    static interaction;
    async dispatch(interaction, data){
        this.interaction = interaction;

        await this.showServerInfo();
    }

    async showServerInfo(){
        const name = this.interaction.guild.name;
        const id = this.interaction.guild.id;
        const owner = await this.interaction.guild.fetchOwner();
        const memberCount = this.interaction.guild.memberCount;
        const channelCount = this.interaction.guild.channels.cache.size;
        await this.interaction.guild.channels.fetch().catch(() => {});
        const textCount = this.interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildNews).size;
        const voiceCount = this.interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const forumCount = this.interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildForum).size;
        const categoryCount = this.interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
        const createdAt = moment(this.interaction.guild.createdTimestamp).format("DD.MM.YYYY HH:mm");
        const createdAgo = this.client.utils.getRelativeTime(this.interaction.guild.createdTimestamp);

        const text =
            " Name: **" + name + "**\n" +
            this.client.emotes.id + " ID: **" + id + "**\n" +
            this.client.emotes.crown + " Eigentümer: **" + owner.user.tag + "**\n" +
            this.client.emotes.users + " Mitglieder: **" + memberCount + "**\n\n" +
            this.client.emotes.list + " Channel: **" + channelCount + "**\n" +
            this.client.emotes.folder + " davon Kategorien: **" + categoryCount + "**\n" +
            this.client.emotes.channel + " davon Text: **" + textCount + "**\n" +
            this.client.emotes.voice + " davon Sprache: **" + voiceCount + "**\n" +
            this.client.emotes.forum + " davon Foren: **" + forumCount + "**\n\n" +
            this.client.emotes.calendar + " Erstellt am: **" + createdAt + "**\n" +
            this.client.emotes.reminder + " Erstellt vor: **" + createdAgo + "**";

        const serverInfoEmbed = this.client.createEmbed("{0}", "discord", "normal", text);

        serverInfoEmbed.setTitle(this.client.emotes.shine + " Informationen zu " + this.interaction.guild.name);
        serverInfoEmbed.setThumbnail(this.interaction.guild.iconURL({dynamic: true}));
        return this.interaction.followUp({ embeds: [serverInfoEmbed] });
    }
}

module.exports = Serverinfo;
