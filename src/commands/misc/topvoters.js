const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

class Topvoters extends BaseCommand {
    constructor(client){
        super(client, {
            name: "topvoters",
            description: "Zeigt die Topvoter an",

            cooldown: 1000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        })
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.showTopVoters();
    }

    async showTopVoters(){
        const topVoters = (await (await mongoose.connection.db.collection("users")).find({"voteCount": { $ne: null}}).sort({ voteCount: -1 }).limit(10).toArray())
        const voters = [];

        let i = 0;
        for(let topVoter of topVoters){
            const user = await this.client.users.fetch(topVoter.id).catch(() => {});
            if(user){
                i++;
                voters.push((i <= 3 ? this.client.emotes[i] : this.client.emotes.arrow) + " **" + user.tag + "** - " + topVoter.voteCount + " Votes" + "\n");
            }
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 10, voters, "Topvoter", "Es gibt noch keine Topvoter");
    }
}

module.exports = Topvoters;