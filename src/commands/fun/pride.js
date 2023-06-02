const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const Jimp = require("jimp");
const axios = require("axios");

class Pride extends BaseCommand {
    constructor(client){
        super(client, {
            name: "pride",
            description: "Sendet einen Avatar mit Pride-Filter",

            cooldown: 1000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addUserOption(option => option
                            .setName("nutzer")
                            .setDescription("Wähle ein Mitglied")
                            .setRequired(false)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data){
        this.interaction = interaction;

        let user = interaction.member.user;
        if(interaction.options.getUser("nutzer")) user = interaction.options.getUser("nutzer");

        return await this.getPrideAvatar(user);
    }

    async getPrideAvatar(user) {
        const avatarUrl = user.displayAvatarURL({dynamic: true, size: 4096, extension: "png"});

        const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data, "binary");

        const image = await Jimp.read(buffer);
        const width = image.getWidth();
        const height = image.getHeight();

        const rainbowColors = [
            '#FF0018', // Rot
            '#FFA52C', // Orange
            '#FFFF41', // Gelb
            '#008018', // Grün
            '#0000F9', // Blau
            '#86007D' // Violett
        ];

        const step = width / rainbowColors.length;
        const rainbowImage = new Jimp(width, height);

        for (let i = 0; i < rainbowColors.length; i++) {
            const color = rainbowColors[i];
            const start = Math.floor(i * step);
            const end = Math.floor((i + 1) * step);

            for (let x = start; x < end; x++) {
                for (let y = 0; y < height; y++) {
                    const hexColor = Jimp.cssColorToHex(color);
                    rainbowImage.setPixelColor(hexColor, x, y);
                }
            }
        }

        rainbowImage.opacity(0.3);
        image.composite(rainbowImage, 0, 0);

        const editedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
        const attachment = new AttachmentBuilder(editedBuffer, {name: "pride.png"});

        const prideAvatarEmbed = this.client.createEmbed("", "", "normal");
        prideAvatarEmbed.setTitle("Pride-Avatar von " + user.tag);
        prideAvatarEmbed.setImage("attachment://pride.png");

        return this.interaction.followUp({embeds: [prideAvatarEmbed], files: [attachment]});
    }
}

module.exports = Pride;
