const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require("discord.js");

class Servericon extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "servericon",
            description: "Sendet das Icon des Servers",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.showServerIcon();
    }

    async showServerIcon(){
        const x64 = this.interaction.guild.iconURL({ extension: "png", size: 64 });
        const x128 = this.interaction.guild.iconURL({ extension: "png", size: 128 });
        const x256 = this.interaction.guild.iconURL({ extension: "png", size: 256 });
        const x512 = this.interaction.guild.iconURL({ extension: "png", size: 512 });
        const x1024 = this.interaction.guild.iconURL({ extension: "png", size: 1024 });
        const x2048 = this.interaction.guild.iconURL({ extension: "png", size: 2048 });

        const avatarEmbed = this.client.generateEmbed("Links: [x64]({0}) • [x128]({1}) • [x256]({2}) • [x512]({3}) • [x1024]({4}) • [x2048]({5})", null, "normal", x64, x128, x256, x512, x1024, x2048);
        avatarEmbed.setTitle("Icon von " + this.interaction.guild.name);
        avatarEmbed.setImage(x256);

        return this.interaction.followUp({ embeds: [avatarEmbed] });
    }
}

module.exports = Servericon;
