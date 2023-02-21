const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const gamesController = require("discord-gamecord");

class Hangman extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "hangman",
            description: "Startet eine Runde Hangman für dich",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    static interaction;

    async dispatch(interaction, data){
        this.interaction = interaction;
        await this.startGame();
    }

    async startGame(){
        const game = new gamesController.Hangman({
            message: this.interaction,
            isSlashGame: true,

            embed: {
                // Game specific options
                title: "Hangman",
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
            requestMessage: "{player} hat dich zu einer Runde Find emoji eingeladen. Willst du das Spiel starten?",
            rejectMessage: "Die Einladung wurde abgelehnt.",
            reqTimeoutMessage: "Die Einladung ist abgelaufen.",

            hangman: { hat: '🎩', head: '😟', shirt: '👕', pants: '🩳', boots: '👞👞' },
            timeoutTime: 120000,
            theme: "discord",
            winMessage: 'Gewonnen! Da Wort war **{word}**.',
            loseMessage: 'Verloren! Das Wort war **{word}**.',
            playerOnlyMessage: 'Das Spiel kann nur durch {player} gesteuert werden.'
        })

        await game.startGame();
    }
}

module.exports = Hangman;