const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require("discord.js");
const Levels = require('discord-xp');

class Leaderboard extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "leaderboard",
            description: "Sendet das Level-Leaderboard",

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

        await this.sendLeaderboard();
    }

    async sendLeaderboard(){
        const leaderboardData = [... await Levels.computeLeaderboard(this.client, await Levels.fetchLeaderboard(this.interaction.guild.id, 10), true)];

        const beautifiedLeaderboard = [];
        for(let user of leaderboardData){
            const emote = user.position < 4 ? this.client.emotes[user.position] : this.client.emotes.arrow;
            beautifiedLeaderboard.push(
                emote + " **" + user.username + "#" + user.discriminator + "**\n" + this.client.emotes.shine2 +" Level " + user.level + "\n" + this.client.emotes.shine2 + " " + this.client.format(user.xp) + " / " + this.client.format(Levels.xpFor(user.level + 1)) + " XP"
            )
        }
        const leaderboardEmbed = this.client.generateEmbed(beautifiedLeaderboard.join("\n\n"), null, "normal", );
        leaderboardEmbed.setThumbnail(this.interaction.guild.iconURL());
        return this.interaction.followUp({ embeds: [leaderboardEmbed] });
    }
}

module.exports = Leaderboard;
