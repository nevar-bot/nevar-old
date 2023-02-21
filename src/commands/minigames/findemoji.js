const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const gamesController = require("discord-gamecord");

class Findemoji extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "findemoji",
            description: "Startet eine Runde Find the emoji für dich",

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
        const game = new gamesController.FindEmoji({
            message: this.interaction,
            isSlashGame: true,

            embed: {
                // Game specific options
                title: "Emoji finden",
                color: this.client.config.embeds["DEFAULT_COLOR"],
                description: 'Merke dir die Emojis in der richtigen Reihenfolge.',
                findDescription: 'Finde den {emoji} Emoji, bevor die Zeit abläuft.',

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

            emojis: ['🍉', '🍇', '🍊', '🍋', '🥭', '🍎', '🍏', '🥝'],
            timeoutTime: 120000,
            hideEmojiTime: 6000,
            winMessage: 'Du hast den richtigen Emoji ausgewählt. {emoji}',
            loseMessage: 'Du hast den falschen Emoji ausgewählt. {emoji}',
            timeoutMessage: 'Die Zeit ist abgelaufen. {emoji}',
            playerOnlyMessage: 'Das Spiel kann nur durch {player} gesteuert werden.'
        })

        await game.startGame();
    }
}

module.exports = Findemoji;