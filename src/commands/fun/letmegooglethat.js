const BaseCommand = require("@structures/BaseCommand");
const { SlashCommandBuilder } = require("discord.js");

class Letmegooglethat extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "letmegooglethat",
            description: "Führt eine Google-Suche durch für Nutzer welche dazu nicht in der Lage sind",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option => option
                            .setName("text")
                            .setDescription("Gib deine Suchanfrage ein")
                            .setRequired(true)
                        )
                        .addUserOption(option => option
                            .setName("nutzer")
                            .setDescription("Wähle für wen du die Suchanfrage durchführen möchtest")
                            .setRequired(false)
                        )
            }
        });
    }

    static interaction;

    async dispatch(interaction, data) {
        this.interaction = interaction;

        return this.googleThat(interaction.options.getString("text"), interaction.options.getUser("nutzer"));
    }

    async googleThat(text, user = null){
        const searchUrl = "https://google.com/search?q=" + encodeURIComponent(text);
        const googleText = user ? "Lass mich das für dich googlen, " + user.username + ": [{0}]({1})" : "Lass mich das für dich googlen: [{0}]({1})";
        const letMeGoogleThatEmbed = this.client.createEmbed(googleText, "search", "normal", text, searchUrl);
        return this.interaction.followUp({ embeds: [letMeGoogleThatEmbed] });
    }
}

module.exports = Letmegooglethat;