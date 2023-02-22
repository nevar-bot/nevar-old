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
                    .addStringOption(option => option
                        .setName("icon")
                        .setDescription("Gib den Link zum Avatar des Autors an")
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
                    .addStringOption(option => option
                        .setName("thumbnail")
                        .setDescription("Gib einen Link zum Thumbnail-Bild an")
                        .setRequired(false)
                    )
                    .addStringOption(option => option
                        .setName("bild")
                        .setDescription("Gib einen Link zum Bild des Embeds an")
                        .setRequired(false)
                    )
                    .addStringOption(option => option
                        .setName("footertext")
                        .setDescription("Gib den Text des Footers an")
                        .setRequired(false)
                    )
                    .addStringOption(option => option
                        .setName("footericon")
                        .setDescription("Gib den Link zum Avatar des Footers an")
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
        const authorIcon = this.interaction.options.getString("icon") || "https://i.pinimg.com/474x/7c/8f/47/7c8f476123d28d103efe381543274c25.jpg";
        const title = this.interaction.options.getString("titel");
        const description = this.interaction.options.getString("beschreibung");
        const thumbnail = this.interaction.options.getString("thumbnail");
        const image = this.interaction.options.getString("bild");
        const footerText = this.interaction.options.getString("footertext");
        const footerIcon = this.interaction.options.getString("footericon");
        const color = this.interaction.options.getString("farbe");

        if(color && !this.client.utils.stringIsHexColor(color)){
            const errorEmbed = this.client.generateEmbed("Du musst eine Farbe im Hex-Format angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(authorIcon && !this.client.utils.urlIsImage(authorIcon)){
            const errorEmbed = this.client.generateEmbed("Das Autor-Icon muss eine URL zu einem Bild sein sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(thumbnail && !this.client.utils.urlIsImage(thumbnail)){
            const errorEmbed = this.client.generateEmbed("Das Thumbnail muss eine URL zu einem Bild sein sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(image && !this.client.utils.urlIsImage(image)){
            const errorEmbed = this.client.generateEmbed("Das Bild muss eine URL zu einem Bild sein sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(footerIcon && !this.client.utils.urlIsImage(footerIcon)){
            const errorEmbed = this.client.generateEmbed("Das Footer-Icon muss eine URL zu einem Bild sein sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        // Generate embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: author, iconURL: authorIcon, url: this.client.config.general["WEBSITE"] })
            .setTitle(title)
            .setDescription(description)
            .setThumbnail(thumbnail)
            .setImage(image)
            .setFooter({ text: footerText, iconURL: footerIcon })
            .setColor(color);

        const webhook = await this.interaction.channel.createWebhook({
            name: author,
            avatar: authorIcon
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