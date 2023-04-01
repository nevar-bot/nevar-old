const BaseCommand = require('@structures/BaseCommand');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

class Embed extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "embed",
            description: "Sendet ein vollständig anpassbares Embed",

            memberPermissions: ["ManageGuild"],
            botPermissions: ["ManageWebhooks"],
            cooldown: 30000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option => option
                        .setName("autor")
                        .setDescription("Gib den Namen des Autors an")
                        .setRequired(true)
                    )
                    .addAttachmentOption(option => option
                        .setName("icon")
                        .setDescription("Wähle den Avatar des Autors")
                        .setRequired(false)
                    )
                    .addStringOption(option => option
                        .setName("titel")
                        .setDescription("Gib den Titel des Embeds an")
                        .setRequired(false)
                    )
                    .addStringOption(option => option
                        .setName("beschreibung")
                        .setDescription("Gib die Beschreibung des Embeds an")
                        .setRequired(false)
                    )
                    .addAttachmentOption(option => option
                        .setName("thumbnail")
                        .setDescription("Wähle das Thumbnail des Embeds")
                        .setRequired(false)
                    )
                    .addAttachmentOption(option => option
                        .setName("bild")
                        .setDescription("Wähle das Bild des Embeds")
                        .setRequired(false)
                    )
                    .addStringOption(option => option
                        .setName("footertext")
                        .setDescription("Gib den Text des Footers an")
                        .setRequired(false)
                    )
                    .addAttachmentOption(option => option
                        .setName("footericon")
                        .setDescription("Wähle das Icon des Footers")
                        .setRequired(false)
                    )
                    .addStringOption(option => option
                        .setName("farbe")
                        .setDescription("Gib die Farbe des Embeds als Hex-Wert an")
                        .setRequired(false)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.generateEmbed();
    }

    async generateEmbed(){
        const author = this.interaction.options.getString("autor");
        const authorIcon = this.interaction.options.getAttachment("icon");
        const title = this.interaction.options.getString("titel");
        const description = this.interaction.options.getString("beschreibung");
        const thumbnail = this.interaction.options.getAttachment("thumbnail");
        const image = this.interaction.options.getAttachment("bild");
        const footerText = this.interaction.options.getString("footertext");
        const footerIcon = this.interaction.options.getAttachment("footericon");
        const color = this.interaction.options.getString("farbe") || this.client.config.embeds["DEFAULT_COLOR"];

        if(color && !this.client.utils.stringIsHexColor(color)){
            const errorEmbed = this.client.generateEmbed("Du musst eine Farbe im Hex-Format angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(authorIcon && !authorIcon.contentType.startsWith("image/")){
            const errorEmbed = this.client.generateEmbed("Das Autor-Icon muss ein Bild sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(thumbnail && !thumbnail.contentType.startsWith("image/")){
            const errorEmbed = this.client.generateEmbed("Das Thumbnail muss ein Bild sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(image && !image.contentType.startsWith("image/")){
            const errorEmbed = this.client.generateEmbed("Das Embed-Bild muss ein Bild sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(footerIcon && !footerIcon.contentType.startsWith("image/")){
            const errorEmbed = this.client.generateEmbed("Das Footer-Icon muss ein Bild sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        // Generate embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: author, iconURL: (authorIcon ? authorIcon.proxyURL : null), url: this.client.config.general["WEBSITE"] })
            .setTitle(title)
            .setDescription(description)
            .setThumbnail(thumbnail ? thumbnail.proxyURL : null)
            .setImage(image ? image.proxyURL : null)
            .setFooter({ text: footerText, iconURL: (footerIcon ? footerIcon.proxyURL : null) })
            .setColor(color);

        const webhook = await this.interaction.channel.createWebhook({
            name: author,
            avatar: authorIcon ? authorIcon.proxyURL : "https://i.pinimg.com/474x/7c/8f/47/7c8f476123d28d103efe381543274c25.jpg"
        }).catch(() => {});

        if(webhook){
            webhook.send({ embeds: [embed] }).catch(() => {
                const errorEmbed = this.client.generateEmbed("Beim Senden des Embeds ist ein Fehler aufgetreten.", "error", "error");
                return this.interaction.followUp({ embeds: [errorEmbed] });
            });
            webhook.delete().catch(() => {});
            const successEmbed = this.client.generateEmbed("Das Embed wurde erstellt und gesendet.", "success", "success");
            return this.interaction.followUp({ embeds: [successEmbed] });
        }else{
            const errorEmbed = this.client.generateEmbed("Beim Erstellen des Webhooks ist ein Fehler aufgetreten.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }
    }
}
module.exports = Embed;