const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require("discord.js");

class Credits extends BaseCommand {
    constructor(client){
        super(client, {
            name: "credits",
            description: "Zeigt Credits an",

            cooldown: 1000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        })
    }

    static interaction;
    async dispatch(interaction, data){
        this.interaction = interaction;

        await this.showCredits();
    }

    async showCredits(){
        const credits =
            this.client.emotes.shine + " Ohne folgende Projekte wäre " + this.client.user.username + " nicht möglich gewesen:\n\n" +
            this.client.emotes.arrow + " [**axios**](https://npmjs.com/package/axios) - HTTP Client\n" +
            this.client.emotes.arrow + " [**body-parser**](https://npmjs.com/package/body-parser) - HTTP Client\n" +
            this.client.emotes.arrow + " [**canvacord**](https://npmjs.com/package/canvacord) - Bildmanipulation für Discord\n" +
            this.client.emotes.arrow + " [**cors**](https://npmjs.com/package/cors) - CORS-Konfiguration\n" +
            this.client.emotes.arrow + " [**discord-gamecord**](https://npmjs.com/package/discord-gamecord) - Discord Minispiele\n" +
            this.client.emotes.arrow + " [**discord-giveaways**](https://npmjs.com/package/discord-giveaways) - Discord Gewinnspiele\n" +
            this.client.emotes.arrow + " [**discord-xp**](https://npmjs.com/package/discord-xp) - Discord Levelsystem \n" +
            this.client.emotes.arrow + " [**discord.js**](https://npmjs.com/package/discord.js) - Discord Client\n" +
            this.client.emotes.arrow + " [**discordbotlist**](https://npmjs.com/package/discordbotlist) - Discordbotlist Statistiken\n" +
            this.client.emotes.arrow + " [**enhanced-ms**](https://npmjs.com/package/enhanced-ms) - Umgang mit Zeit-Strings\n" +
            this.client.emotes.arrow + " [**express**](https://npmjs.com/package/express) - Web Framework\n" +
            this.client.emotes.arrow + " [**helmet**](https://npmjs.com/package/helmet) - Sicherheits Middleware\n" +
            this.client.emotes.arrow + " [**mathjs**](https://npmjs.com/package/mathjs) - mathematische Berechnungen\n" +
            this.client.emotes.arrow + " [**module-alias**](https://npmjs.com/package/module-alias) - Modulpfadleasing\n" +
            this.client.emotes.arrow + " [**moment**](https://npmjs.com/package/moment) - Umgang mit Daten\n" +
            this.client.emotes.arrow + " [**mongoose**](https://npmjs.com/package/mongoose) - MongoDB Framework\n" +
            this.client.emotes.arrow + " [**node-emoji**](https://npmjs.com/package/node-emoji) - Umgang mit Emojis\n" +
            this.client.emotes.arrow + " [**node-schedule**](https://npmjs.com/package/node-schedule) - NodeJS Cronjobs\n" +
            this.client.emotes.arrow + " [**pino**](https://npmjs.com/package/pino) - NodeJS Logger\n" +
            this.client.emotes.arrow + " [**pino-pretty**](https://npmjs.com/package/pino-pretty) - Formatierer für Pino\n" +
            this.client.emotes.arrow + " [**toml**](https://npmjs.com/package/toml) - TOML-Config\n" +
            this.client.emotes.arrow + " [**icons**](https://discord.gg/9AtkECMX2P) - Emojis für " + this.client.user.username;

        const creditsEmbed = this.client.generateEmbed(credits, null, "normal");
        creditsEmbed.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true, size: 512 }));

        return this.interaction.followUp({ embeds: [creditsEmbed] });
    }
}

module.exports = Credits;