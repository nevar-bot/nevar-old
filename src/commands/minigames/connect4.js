const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const gamesController = require("discord-gamecord");

class Connect4 extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "connect4",
            description: "Fordere jemanden zu einer Runde Vier gewinnt heraus",

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
        const game = new gamesController.Connect4({
            message: this.interaction,
            isSlashGame: true,
            opponent: this.interaction.options.getUser("gegner"),

            embed: {
                // Game specific options
                title: "Vier gewinnt",
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
            requestMessage: "{player} hat dich zu einer Runde Vier gewinnt eingeladen. Willst du das Spiel starten?",
            rejectMessage: "Die Einladung wurde abgelehnt.",
            reqTimeoutMessage: "Die Einladung ist abgelaufen.",

            emojis: {
                board: '⚪',
                player1: '🔴',
                player2: '🟡'
            },
            timeoutTime: 120000,
            turnMessage: "{emoji} | {player} ist dran",
            winMessage: "{emoji} | {player} hat gewonnen!",
            tieMessage: "Unentschieden!",
            timeoutMessage: "Die Zeit ist abgelaufen, es gibt keinen Sieger.",
            playerOnlyMessage: 'Das Spiel kann nur durch {player} und {opponent} gesteuert werden.'
        })

        await game.startGame();
    }
}

module.exports = Connect4;