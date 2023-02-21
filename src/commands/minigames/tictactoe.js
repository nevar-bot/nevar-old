const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const gamesController = require("discord-gamecord");

class TicTacToe extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "tictactoe",
            description: "Fordere jemanden zu einer Runde Tic-Tac-Toe heraus",

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
        const game = new gamesController.TicTacToe({
            message: this.interaction,
            isSlashGame: true,
            opponent: this.interaction.options.getUser("gegner"),

            embed: {
                // Game specific options
                title: "Tic Tac Toe",
                statusTitle: "Status",
                color: this.client.config.embeds["DEFAULT_COLOR"],

                // Default options
                overTitle: "Spiel beendet",
                requestTitle: "Spieleinladung",
                requestColor: this.client.config.embeds["DEFAULT_COLOR"],
                rejectTitle: "Spieleinladung abgelehnt",
                rejectColor: this.client.config.embeds["ERROR_COLOR"],
            },
            buttons: {
                accept: "Akzeptieren",
                reject: "Ablehnen"
            },
            mentionUser: true,
            reqTimeoutTime: 60000,
            requestMessage: "{player} hat dich zu einer Runde Tic-Tac-Toe eingeladen. Willst du das Spiel starten?",
            rejectMessage: "Die Einladung wurde abgelehnt.",
            reqTimeoutMessage: "Die Einladung ist abgelaufen.",

            emojis: {
                xButton: '❌',
                oButton: '🔵',
                blankButton: '➖'
            },
            xButtonStyle: 'DANGER',
            oButtonStyle: 'PRIMARY',
            turnMessage: '{emoji} | **{player}** ist dran.',
            winMessage: '{emoji} | **{player}** hat das Spiel gewonnen!',
            tieMessage: 'Unentschieden!',
            timeoutMessage: 'Die Zeit ist abgelaufen, es gibt keinen Sieger.',
            timeoutTime: 120000,
            playerOnlyMessage: 'Das Spiel kann nur durch {player} und {opponent} gesteuert werden.'
        })

        await game.startGame();
    }
}

module.exports = TicTacToe;