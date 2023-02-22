const BaseCommand = require('@structures/BaseCommand');
const mongoose = require("mongoose");

class Bughunters extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "bughunters",
            description: "Verwaltet die Bughunter des Bots",

            cooldown: 2000,
            ownerOnly: true,
            dirname: __dirname,

            slashCommand: {
                addCommand: false
            }
        });
    }

    static message;
    async dispatch(message, args, data) {
        this.message = message;
        if(!args[0]){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst zwischen folgenden Aktionen wählen: add, remove, list", "error", "error");
            return message.reply({ embeds: [invalidOptionsEmbed] });
        }
        switch(args[0]){
            case "add":
                args.shift();
                await this.addBughunter(args);
                break;
            case "remove":
                args.shift();
                await this.removeBughunter(args);
                break;
            case "list":
                await this.listBughunters();
                break;
            default:
                const invalidOptionsEmbed = this.client.generateEmbed("Du musst zwischen folgenden Aktionen wählen: add, remove, list", "error", "error");
                return message.reply({ embeds: [invalidOptionsEmbed] });
        }
    }

    async addBughunter(args){
        const member = await this.message.guild.resolveMember(args[0]);
        if(!member){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst ein Mitglied angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        const userdata = await this.client.findOrCreateUser({ id: member.user.id });
        userdata.bughunter = {
            state: true,
        }
        userdata.markModified("bughunter");
        await userdata.save();

        const successEmbed = this.client.generateEmbed("{0} wurde als Bug-Hunter hinzugefügt.", "success", "success", member.user.tag);
        return this.message.reply({ embeds: [successEmbed] });
    }

    async removeBughunter(args){
        const member = await this.message.guild.resolveMember(args[0]);
        if(!member){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst ein Mitglied angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        const userdata = await this.client.findOrCreateUser({ id: member.user.id });
        if(!userdata.bughunter.state){
            const invalidOptionsEmbed = this.client.generateEmbed("Dieses Mitglied ist kein Bug-Hunter.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        userdata.bughunter = {
            state: false,
        }
        userdata.markModified("bughunter");
        await userdata.save();

        const successEmbed = this.client.generateEmbed("{0} wurde als Bughunter entfernt.", "success", "success", member.user.tag);
        return this.message.reply({ embeds: [successEmbed] });
    }

    async listBughunters(){
        const bughuntersdata = (await (await mongoose.connection.db.collection("users")).find({ "bughunter.state": true }).toArray())
        let bughunters = [];
        for(let userdata of bughuntersdata){
            const user = await this.client.users.fetch(userdata.id).catch(() => {});
            bughunters.push(user.tag);
        }
        if(bughunters.length === 0) bughunters = ["Keine Bug-Hunter vorhanden"];

        const embed = this.client.generateEmbed("Folgend sind alle Bot-Partner aufgelistet:\n\n{0} {1}", "arrow", "normal", this.client.emotes.shine2, bughunters.join("\n" + this.client.emotes.shine2 + " "));

        return this.message.reply({ embeds: [embed] });
    }
}
module.exports = Bughunters;
