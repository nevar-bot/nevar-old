const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs');

class Topic extends BaseCommand {
    constructor(client){
        super(client, {
            name: "topic",
            description: "Sendet ein zufälliges Thema für eine Unterhaltung",

            cooldown: 1000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
            }
        });
    }

    static interaction;
    async dispatch(interaction, data){
        this.interaction = interaction;

        return await this.getTopic();
    }

    async getTopic(){
        const json = JSON.parse(fs.readFileSync(('./assets/topics.json')));
        const topics = Object.values(json);

        return this.interaction.followUp({ content: topics[Math.floor(Math.random() * topics.length)] });
    }
}

module.exports = Topic;
