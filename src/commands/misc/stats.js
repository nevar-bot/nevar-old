const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment');
const fs = require('fs');
const mongoose = require("mongoose");

class Stats extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "stats",
            description: "Zeigt allgemeine Statistiken über den Bot an",

            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;
        await this.sendStats();
    }

    async sendStats(){
        const staffsdata = (await (await mongoose.connection.db.collection("users")).find({ "staff.state": true }).toArray())
        const staffs = [];
        for(let ownerId of this.client.config.general["OWNER_IDS"]){
            const owner = await this.client.users.fetch(ownerId).catch(() => {});
            staffs.push(owner.tag);
        }
        for(let userdata of staffsdata){
            const user = await this.client.users.fetch(userdata.id).catch(() => {});
            if(!staffs.includes(user.tag)) staffs.push(user.tag);
        }
        const uptime = this.client.utils.getRelativeTime(Date.now() - this.client.uptime);
        const serverCount = this.client.guilds.cache.size;
        const voteCount = JSON.parse(fs.readFileSync('./assets/votes.json'))[moment().format("MMMM").toLowerCase()] || 0;
        const userCount = this.client.guilds.cache.reduce((sum, guild) => sum + (guild.available ? guild.memberCount : 0), 0);
        const channelCount = this.client.channels.cache.size;
        const commandCount = this.client.commands.filter((cmd) => !cmd.conf.ownerOnly && !cmd.conf.staffOnly).size;
        const executedCommands = (await (await mongoose.connection.db.collection("logs").find({})).toArray()).length;
        const packageJson = require("@root/package.json");
        const botVersion = packageJson.version;
        const nodeVer = process.version.replace("v", "");
        const djsV = require("discord.js").version;

        const text =
            this.client.emotes.users + " Staffs: **\n"+ this.client.emotes.shine2 + " " + staffs.join("\n" + this.client.emotes.shine2 + " ") + "**\n\n" +
            this.client.emotes.rocket + " Server: **" + this.client.format(serverCount) + "**\n" +
            this.client.emotes.users + " Nutzer: **" + this.client.format(userCount) + "**\n" +
            this.client.emotes.channel + " Channel: **" + this.client.format(channelCount) + "**\n\n" +
            this.client.emotes.reminder + " Uptime: **" + uptime + "**\n" +
            this.client.emotes.shine + " Votes diesen Monat: **" + this.client.format(voteCount) + "**\n\n" +
            this.client.emotes.slashcommand + " Befehle: **" + commandCount + "**\n" +
            this.client.emotes.loading + " Befehle ausgeführt: **" + this.client.format(executedCommands) + "**\n\n" +
            this.client.emotes.code + " Bot-Version: **" + botVersion + "**\n" +
            this.client.emotes.discordjs + " Discord.js-Version: **" + djsV + "**\n" +
            this.client.emotes.javascript + " NodeJS-Version: **" + nodeVer + "**";

        const statsEmbed = this.client.generateEmbed(text, null, "normal");
        statsEmbed.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }));
        statsEmbed.setTitle("Statistiken zu " + this.client.user.username);

        return this.interaction.followUp({ embeds: [statsEmbed] });
    }
}
module.exports = Stats;
