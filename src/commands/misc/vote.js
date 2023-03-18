const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');

class Vote extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "vote",
            description: "Vote für Nevar",

            cooldown: 5000,
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

        await this.sendVote();
    }

    async sendVote(){

        const voteButton = this.client.createButton(null, "Voten", "Link", this.client.emotes.heart, false, "https://discordbotlist.com/bots/" + this.client.user.id + "/upvote");
        const buttonRow = this.client.createComponentsRow( voteButton);

        const linksEmbed = this.client.generateEmbed("Du möchtest Nevar kostenfrei unterstützen? Drücke unten auf den Knopf führe paar Schritte durch und schon hast du uns ein bisschen geholfen. :)", "arrow", "normal");

        return this.interaction.followUp({ embeds: [linksEmbed], components: [buttonRow] });
    }
}

module.exports = Vote;
