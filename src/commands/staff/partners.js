const BaseCommand = require('@structures/BaseCommand');
const mongoose = require("mongoose");

class Partners extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "partners",
            description: "Verwaltet die Partner des Bots",

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
                await this.addPartner(args);
                break;
            case "remove":
                args.shift();
                await this.removePartner(args);
                break;
            case "list":
                await this.listPartners();
                break;
            default:
                const invalidOptionsEmbed = this.client.generateEmbed("Du musst zwischen folgenden Aktionen wählen: add, remove, list", "error", "error");
                return message.reply({ embeds: [invalidOptionsEmbed] });
        }
    }

    async addPartner(args){
        const member = await this.message.guild.resolveMember(args[0]);
        if(!member){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst ein Mitglied angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        const userdata = await this.client.findOrCreateUser({ id: member.user.id });
        userdata.partner = {
            state: true,
        }
        userdata.markModified("partner");
        await userdata.save();

        const successEmbed = this.client.generateEmbed("{0} wurde als Partner hinzugefügt.", "success", "success", member.user.tag);
        return this.message.reply({ embeds: [successEmbed] });
    }

    async removePartner(args){
        const member = await this.message.guild.resolveMember(args[0]);
        if(!member){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst ein Mitglied angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        const userdata = await this.client.findOrCreateUser({ id: member.user.id });
        if(!userdata.partner.state){
            const invalidOptionsEmbed = this.client.generateEmbed("Dieses Mitglied ist kein Partner.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        userdata.partner = {
            state: false,
        }
        userdata.markModified("partner");
        await userdata.save();

        const successEmbed = this.client.generateEmbed("{0} wurde als Partner entfernt.", "success", "success", member.user.tag);
        return this.message.reply({ embeds: [successEmbed] });
    }

    async listPartners(){
        const partnersdata = (await (await mongoose.connection.db.collection("users")).find({ "partner.state": true }).toArray())
        let partners = [];
        for(let userdata of partnersdata){
            const user = await this.client.users.fetch(userdata.id).catch(() => {});
            partners.push(user.tag);
        }
        if(partners.length === 0) partners = ["Keine Partner vorhanden"];

        const embed = this.client.generateEmbed("Folgend sind alle Bot-Partner aufgelistet:\n\n{0} {1}", "arrow", "normal", this.client.emotes.shine2, partners.join("\n" + this.client.emotes.shine2 + " "));

        return this.message.reply({ embeds: [embed] });
    }
}
module.exports = Partners;
