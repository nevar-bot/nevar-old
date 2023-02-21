const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const gamesController = require("discord-gamecord");

class RockPaperScissors extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "rockpaperscissors",
            description: "Startet eine Runde Schere Stein Papier",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addUserOption(option => option
                        .setName("gegner")
                        .setDescription("Wähle einen Gegner")
                        .setRequired(true)
                    )
            }
        });
    }

    static interaction;

    async dispatch(interaction, data){
        this.interaction = interaction;
        await this.startGame();
    }

    async startGame(){
        const game = new gamesController.RockPaperScissors({
            message: this.interaction,
            isSlashGame: true,
            opponent: this.interaction.options.getUser("gegner"),

            embed: {
                // Game specific options
                title: "Schere Stein Papier",
                color: this.client.config.embeds["DEFAULT_COLOR"],
                description: 'Wähle dein Item aus den Buttons',

                // Default options
                overTitle: "Spiel beendet",
                requestTitle: "Spieleinladung",
                requestColor: this.client.config.embeds["DEFAULT_COLOR"],
                rejectTitle: "Spieleinladung abgelehnt",
                rejectColor: this.client.config.embeds["ERROR_COLOR"],
            },
            mentionUser: true,
            reqTimeoutTime: 60000,
            requestMessage: "{player} hat dich zu einer Runde Schere-Stein-Papier eingeladen. Willst du das Spiel starten?",
            rejectMessage: "Die Einladung wurde abgelehnt.",
            reqTimeoutMessage: "Die Einladung ist abgelaufen.",
            buttons: {
                accept: "Akzeptieren",
                reject: "Ablehnen",
                rock: 'Stein',
                paper: 'Papier',
                scissors: 'Schere'
            },
            emojis: {
                rock: '🌑',
                paper: '📰',
                scissors: '✂️'
            },

            timeoutTime: 120000,
            pickMessage: 'Du hast {emoji} gewählt.',
            winMessage: '**{player}** hat gewonnen!',
            tieMessage: 'Unentschieden!',
            timeoutMessage: 'Die Zeit ist abgelaufen, es gibt keinen Sieger.',
            playerOnlyMessage: 'Das Spiel kann nur durch {player} und {opponent} gesteuert werden.'
        })

        await game.startGame();
    }
}

module.exports = RockPaperScissors;