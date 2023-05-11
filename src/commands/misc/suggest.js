const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

class Suggest extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "suggest",
            description: "Reicht eine Idee ein",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option => option
                        .setName("idee")
                        .setDescription("Gib deine Idee ein")
                        .setRequired(true)
                    )
                    .addAttachmentOption(option => option
                        .setName("bild")
                        .setDescription("Füge ggf. ein Bild hinzu")
                        .setRequired(false)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.suggest(interaction.options.getString("idee"), interaction.options.getAttachment("bild"), data);
    }

    async suggest(idea, image, data){
        if(!data.guild.settings.suggestions.enabled){
            const isNotEnabledEmbed = this.client.createEmbed("Da das Ideen-System nicht aktiviert ist, können keine Ideen eingereicht werden.", "error", "error");
            return this.interaction.followUp({ embeds: [isNotEnabledEmbed] });
        }

        const channel = this.client.channels.cache.get(data.guild.settings.suggestions.channel);
        if(!channel){
            const channelNotFoundEmbed = this.client.createEmbed("Der Ideen-Channel wurde nicht gefunden.", "error", "error");
            return this.interaction.followUp({ embeds: [channelNotFoundEmbed] });
        }

        if(image && !image.contentType.startsWith("image/")){
            const notAnImageEmbed = this.client.createEmbed("Die angehängte Datei muss ein Bild sein.", "error", "error");
            return this.interaction.followUp({ embeds: [notAnImageEmbed] });
        }
        const url = image ? image.proxyURL : null;

        const successEmbed = this.client.createEmbed("Deine Idee wurde eingereicht.", "success", "success");
        await this.interaction.followUp({ embeds: [successEmbed] });
        return this.client.emit("SuggestionSubmitted", this.interaction, data, this.interaction.guild, idea, url);
    }
}
module.exports = Suggest;