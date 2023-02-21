const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "other";
    }

    getType(){
        return this.type;
    }

    async dispatch(interaction, data, guild, suggestion) {
        let embed = new EmbedBuilder()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setTitle(guild.translate("administration/suggestsettings:main:new")
                .replace('{user}', interaction.member.user.username))
            .setDescription(this.client.emotes.arrow + ' ' + suggestion)
            .setColor(this.client.embedColor)
            .setThumbnail(interaction.member.user.displayAvatarURL({dynamic: true}))
            .setFooter({text: '👍 0 • 👎 0'});
        let id = interaction?.member?.user?.id
        let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('suggestion_' + id + '_yes')
                    .setEmoji('👍')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('suggestion_' + id + '_no')
                    .setEmoji('👎')
                    .setStyle(ButtonStyle.Primary)
            )

        let suggestChannel = guild.channels.cache.get(data.guild.plugins.suggestionSystem.channel);
        if (!suggestChannel) return;
        let sent = await suggestChannel.send({embeds: [embed], components: [row]}).catch(() => {});

        let modChannel = guild.channels.cache.get(data.guild.plugins.suggestionSystem.modChannel);
        if (!modChannel) return;

        let modEmbed = new EmbedBuilder()
            .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website })
            .setTitle(guild.translate("administration/suggestsettings:main:new")
                .replace('{user}', interaction.member.user.username))
            .setDescription(this.client.emotes.arrow + ' ' + suggestion)
            .setColor(this.client.embedColor)
            .setThumbnail(interaction.member.user.displayAvatarURL({dynamic: true}))
            .setFooter({text: this.client.footer});

        let row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('modSuggestion_' + id + '_' + sent.id + '_' + suggestChannel.id + '_accept')
                    .setEmoji('👍')
                    .setLabel(guild.translate("administration/suggestsettings:main:accept"))
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('modSuggestion_' + id + '_' + sent.id + '_' + suggestChannel.id + '_decline')
                    .setEmoji('👎')
                    .setLabel(guild.translate("administration/suggestsettings:main:decline"))
                    .setStyle(ButtonStyle.Danger)
            )
        modChannel.send({embeds: [modEmbed], components: [row2]})
    }
}