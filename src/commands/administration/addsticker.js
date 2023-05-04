const BaseCommand = require('@structures/BaseCommand');
const { parseEmoji, SlashCommandBuilder } = require('discord.js');
const { stringIsUrl, urlIsImage, stringIsEmoji } = require("@helpers/Utils");
const nodeEmoji = require("node-emoji");

class Addsticker extends BaseCommand {
    constructor(client){
        super(client, {
            name: "addsticker",
            description: "Fügt einen neuen Sticker hinzu",

            memberPermissions: ["ManageGuildExpressions"],
            botPermissions: ["ManageGuildExpressions"],

            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option => option
                        .setName("url")
                        .setDescription("Gib einen Link zu einem Bild an")
                        .setRequired(true)
                    )
                    .addStringOption(option => option
                        .setName("name")
                        .setDescription("Gib einen Namen für den Sticker an")
                        .setRequired(true)
                        .setMaxLength(32)
                    )
                    .addStringOption(option => option
                        .setName("emoji")
                        .setDescription("Gib einen Standard-Discord-Emoji an, welches den Sticker repräsentiert")
                        .setRequired(true)
                    )
                    .addStringOption(option => option
                        .setName("beschreibung")
                        .setDescription("Gib eine Beschreibung für den Sticker an")
                        .setRequired(false)
                    )
            }
        })
    }

    static interaction;

    async dispatch(interaction, data){
        this.interaction = interaction;

        await this.addSticker(interaction.options.getString("url"), interaction.options.getString("name"), interaction.options.getString("emoji"), interaction.options.getString("beschreibung"));

    }

    async addSticker(url, name, tags, description){
        const sticker = { file: undefined, name: undefined, tags: undefined, description: undefined, reason: "/addsticker Befehl" };

        if(!stringIsUrl(url) || !urlIsImage(url) || !stringIsEmoji(tags) || !nodeEmoji.find(tags)){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst einen Link zu einem Bild und einen Standard-Emoji angeben. Bitte beachte, dass derzeit nicht alle Emojis unterstützt sind.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        sticker.file = url;
        sticker.name = name;
        sticker.tags = nodeEmoji.find(tags).key;
        sticker.description = description;

        try {
            await this.interaction.guild.stickers.create(sticker);
            const successEmbed = this.client.generateEmbed("Ich habe den Sticker {0} für dich erstellt.", "success", "success", name);
            successEmbed.setThumbnail(url);
            return this.interaction.followUp({ embeds: [successEmbed] });
        }catch(e){
            // Error
            const errorEmbed = this.client.generateEmbed("Ein unerwarteter Fehler ist aufgetreten.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }
    }
}

module.exports = Addsticker;