const BaseCommand = require('@structures/BaseCommand');
const moment = require("moment");

class Block extends BaseCommand {
    constructor(client){
        super(client, {
            name: "block",
            description: "Blockiert einen Server oder Nutzer",

            cooldown: 3000,
            staffOnly: true,
            dirname: __dirname,

            slashCommand: {
                addCommand: false
            }
        });
    }

    static message;
    async dispatch(message, args, data){
        this.message = message;

        const action = args[0].toLowerCase();
        args.shift();
        switch(action){
            case "add":
                await this.block(args);
                break;
            case "remove":
                await this.unblock(args);
                break;
            case "list":
                await this.listBlocked(args);
                break;
            default:
                const invalidOptionsEmbed = this.client.generateEmbed("Du musst zwischen add, remove und list wählen.", "error", "error");
                await message.reply({ embeds: [invalidOptionsEmbed] });
                break;

        }
    }

    async block(args){
        // get id and reason
        const id = args.shift();
        const reason = args.join(' ') || "Kein Grund angegeben";

        // check if target is a user or guild
        const type = await this.client.users.fetch(id).catch(() => {}) ? "user" : "guild";

        // fetch target guild/user
        const target = type === "user" ? await this.client.users.fetch(id).catch(() => {}) : await this.client.guilds.fetch(id).catch(() => {});

        // no target found
        if(!target){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst die ID eines Servers oder Nutzers angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        // target is client
        if(target.id === this.client.user.id){
            const invalidOptionsEmbed = this.client.generateEmbed("Du kannst mich nicht blockieren.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        // target is message author
        if(target.id === this.message.author.id){
            const invalidOptionsEmbed = this.client.generateEmbed("Du kannst dich nicht selbst blockieren.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        // target is support server
        if(target.id === this.client.config.support["ID"]){
            const invalidOptionsEmbed = this.client.generateEmbed("Du kannst den Support-Server nicht blockieren.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        // target is bot owner
        if(this.client.config.general["OWNER_IDS"].includes(target.id)){
            const invalidOptionsEmbed = this.client.generateEmbed("Du kannst den Bot-Eigentümer nicht blockieren.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        // get target data
        const targetData = type === "user" ? await this.client.findOrCreateUser( { id: id }) : await this.client.findOrCreateGuild( { id: id });

        // target is already blocked
        if(targetData.blocked.state){
            const invalidOptionsEmbed = this.client.generateEmbed("Dieser Nutzer oder Server ist bereits blockiert.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        // save to database
        targetData.blocked = {
            state: true,
            reason: reason,
            date: Date.now(),
            moderator: this.message.author.tag,
            name: type === "user" ? target.tag : target.name
        };
        targetData.markModified("blocked");
        await targetData.save();

        const string = type === "user" ? "Nutzer " + target.tag : "Server " + target.name;
        const successEmbed = this.client.generateEmbed("Der " + string + " wurde blockiert.", "success", "success");
        return this.message.reply({ embeds: [successEmbed] });
    }

    async unblock(args){
        console.log(args);
        // get id
        const id = args.shift();

        if(!id){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst die ID eines Servers oder Nutzers angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        // get target user/guild data
        const targetData = (await this.client.usersData.find({ "id": id }))[0] || (await this.client.guildsData.find({ "id": id }))[0];

        // no target found
        if(!targetData){
            const noTargetEmbed = this.client.generateEmbed("Es wurde kein Nutzer oder Server mit dieser ID gefunden.", "error", "error");
            return this.message.reply({ embeds: [noTargetEmbed] });
        }

        // target is not blocked
        if(!targetData.blocked.state){
            const invalidOptionsEmbed = this.client.generateEmbed("Dieser Nutzer oder Server ist nicht blockiert.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        // unblock target
        const name = targetData.blocked.name;
        targetData.blocked = {
            state: false,
            reason: null,
            date: null,
            moderator: null,
            name: null

        };
        targetData.markModified("blocked");
        await targetData.save();

        const successEmbed = this.client.generateEmbed("{0} wurde entblockt.", "success", "success", name);
        return this.message.reply({ embeds: [successEmbed] });
    }

    async listBlocked(){
        let blocked = [];

        // blocked users
        const blockedUsers = await this.client.usersData.find({ "blocked.state": true });
        for(let userData of blockedUsers){
            const user = await this.client.users.fetch(userData.id).catch(() => {});
            const text =
                " **" + (user ? user.tag : userData.blocked.name) + "** (" + (user ? user.id : userData.id) + ")\n" +
                this.client.emotes.arrow + " Typ: Nutzer\n" +
                this.client.emotes.arrow + " Grund: " + userData.blocked.reason + "\n" +
                this.client.emotes.arrow + " Blockiert am: " + moment(userData.blocked.date).format("DD.MM.YYYY HH:mm") + "\n" +
                this.client.emotes.arrow + " Blockiert von: " + userData.blocked.moderator + "\n";
            blocked.push(text);
        }

        // blocked guilds
        const blockedGuilds = await this.client.guildsData.find({ "blocked.state": true });
        for(let guildData of blockedGuilds){
            const guild = await this.client.guilds.fetch(guildData.id).catch(() => {});
            const text =
                " **" + (guild ? guild.name : guildData.blocked.name) + "** (" + (guild ? guild.id : guildData.id) + ")\n" +
                this.client.emotes.arrow + " Typ: Server\n" +
                this.client.emotes.arrow + " Grund: " + guildData.blocked.reason + "\n" +
                this.client.emotes.arrow + " Blockiert am: " + moment(guildData.blocked.date).format("DD.MM.YYYY HH:mm") + "\n" +
                this.client.emotes.arrow + " Blockiert von: " + guildData.blocked.moderator + "\n";
            blocked.push(text);
        }

        await this.client.utils.sendPaginatedEmbedMessage(this.message, 3, blocked, "Blockierte Nutzer und Server", "Es sind keine Nutzer oder Server blockiert", "ban");
    }
}

module.exports = Block
