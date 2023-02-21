const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const Levels = require('discord-xp');

class Xpfor extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "xpfor",
            description: "Zeigt, wieviel XP für ein bestimmtes Level benötigt wird",
            cooldown: 5000,
            dirname: __dirname,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addIntegerOption(option => option
                            .setName("level")
                            .setDescription("Gib das Level an")
                            .setMinValue(1)
                            .setRequired(true)
                        )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;
        await this.sendXpFor(interaction.options.getInteger("level"), data);
    }

    async sendXpFor(level, data){

        function secondsToTime(secs){
            secs = Math.round(secs);
            const hours = Math.floor(secs / (60 * 60));

            const divisor_minutes = secs % (60 * 60);
            const minutes = Math.floor(divisor_minutes / 60);

            const divisor_seconds = divisor_minutes % 60;
            const seconds = Math.ceil(divisor_seconds);

            return hours + 'h ' + minutes + 'm ' + seconds + 's';
        }

        const minXp = data.guild.settings.levels.xp.min;
        const maxXp = data.guild.settings.levels.xp.max;
        const averageXp = Math.round((minXp + maxXp) / 2);
        const neededXp = this.client.format(Levels.xpFor(level));
        const timeoutLengthInSeconds = 15;
        const neededTime = secondsToTime(Levels.xpFor(level) / averageXp * timeoutLengthInSeconds);
        const neededMessages = this.client.format(Math.round(Levels.xpFor(level) / averageXp));

        const text =
            "Um Level **" + level + "** zu erreichen, werden **" + neededXp + " XP** benötigt.\n" +
            this.client.emotes.arrow + " Auf diesem Server werden " + minXp + " bis " + maxXp + " XP pro Nachricht vergeben, der Durchschnitt liegt bei " + averageXp + " XP pro Nachricht.\n" +
            this.client.emotes.arrow + " Bei einem Timeout von 15 Sekunden, entspricht dies etwa **" + neededMessages + " Nachrichten**, und einem Zeitaufwand von **" + neededTime + "**.";

        const xpForEmbed = this.client.generateEmbed("{0}", "arrow", "normal", text);
        return this.interaction.followUp({ embeds: [xpForEmbed] })
    }
}

module.exports = Xpfor;
