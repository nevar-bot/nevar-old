const BaseCommand = require('@structures/BaseCommand');
const { parseEmoji, SlashCommandBuilder } = require('discord.js');
const { stringIsUrl, urlIsImage, stringIsCustomEmoji } = require("@helpers/Utils");

class Addemoji extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "addemoji",
            description: "Fügt einen neuen Emoji hinzu",

            memberPermissions: ["ManageEmojisAndStickers"],
            botPermissions: ["ManageEmojisAndStickers"],

            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option => option
                        .setRequired(true)
                        .setName("emoji")
                        .setDescription("Gib einen Emoji (oder Link zu einem Bild) ein")
                    )
                    .addStringOption(option => option
                        .setRequired(false)
                        .setName("name")
                        .setDescription("Gib einen Namen für den Emoji ein")
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data){
        this.interaction = interaction;

        await this.addEmoji(interaction.options.getString("emoji"), interaction.options.getString("name"), interaction.guild, interaction.user);
    }

    async addEmoji(emoji, name, guild, user){
        const emote = { name: undefined, url: undefined };
        // Invalid options
        if((!stringIsCustomEmoji(emoji) && !stringIsUrl(emoji)) || (stringIsUrl(emoji) && !urlIsImage(emoji)) || (stringIsUrl(emoji) && urlIsImage(emoji) && !name)){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst einen Emoji oder einen Link zu einem Bild angeben. Bei einem Link muss zusätzlich ein Name gegeben sein.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        if(stringIsCustomEmoji(emoji)){
            const parsedEmoji = parseEmoji(emoji);
            emote.name = (!name ? parsedEmoji.name : name);
            emote.url = "https://cdn.discordapp.com/emojis/" + parsedEmoji.id + (parsedEmoji.animated ? ".gif" : ".png");
        }else if(stringIsUrl(emoji) && urlIsImage(emoji)){
            emote.name = name;
            emote.url = emoji;
        }

        try {
            const createdEmote = await guild.emojis.create({
                attachment: emote.url,
                name: emote.name,
                reason: "/addemoji Command"
            });
            // Success
            const successEmbed = this.client.generateEmbed("Ich habe {0} für dich erstellt.", "success", "success", createdEmote);
            return this.interaction.followUp({ embeds: [successEmbed] });
        }catch(exception){
            // Error
            const errorEmbed = this.client.generateEmbed("Ein unerwarteter Fehler ist aufgetreten.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }
    }
}

module.exports = Addemoji;