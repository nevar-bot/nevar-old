const BaseCommand = require('@structures/BaseCommand');
const mongoose = require("mongoose");

class Staffs extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "staffs",
            description: "Verwaltet die Staffs des Bots",

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
            const invalidOptionsEmbed = this.client.createEmbed("Du musst zwischen folgenden Aktionen wählen: add, remove, list", "error", "error");
            return message.reply({ embeds: [invalidOptionsEmbed] });
        }
        switch(args[0]){
            case "add":
                args.shift();
                await this.addStaff(args);
                break;
            case "remove":
                args.shift();
                await this.removeStaff(args);
                break;
            case "list":
                await this.listStaffs();
                break;
            default:
                const invalidOptionsEmbed = this.client.createEmbed("Du musst zwischen folgenden Aktionen wählen: add, remove, list", "error", "error");
                return message.reply({ embeds: [invalidOptionsEmbed] });
        }
    }

    async addStaff(args){
        const member = await this.message.guild.resolveMember(args[0]);
        if(!member){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst ein Mitglied angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }
        if(!args[1]){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst einen Staff-Typ angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }
        if(!['head-staff', 'staff'].includes(args[1].toLowerCase())){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst entweder \"staff\" oder \"head-staff\" als Staff-Typ angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        const userdata = await this.client.findOrCreateUser({ id: member.user.id });
        userdata.staff = {
            state: true,
            role: args[1].toLowerCase()
        }
        userdata.markModified("staff");
        await userdata.save();

        const string = args[1].toLowerCase() === "head-staff" ? "Head-Staff" : "Staff";
        const successEmbed = this.client.createEmbed("{0} wurde als {1} hinzugefügt.", "success", "success", member.user.tag, string);
        return this.message.reply({ embeds: [successEmbed] });
    }

    async removeStaff(args){
        const member = await this.message.guild.resolveMember(args[0]);
        if(!member){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst ein Mitglied angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        const userdata = await this.client.findOrCreateUser({ id: member.user.id });
        if(!userdata.staff.state){
            const invalidOptionsEmbed = this.client.createEmbed("Dieses Mitglied ist kein Staff.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        userdata.staff = {
            state: false,
            role: null
        }
        userdata.markModified("staff");
        await userdata.save();

        const successEmbed = this.client.createEmbed("{0} wurde als Staff entfernt.", "success", "success", member.user.tag);
        return this.message.reply({ embeds: [successEmbed] });
    }

    async listStaffs(){
        const staffsdata = (await (await mongoose.connection.db.collection("users")).find({ "staff.state": true }).toArray())
        let staffs = [];
        for(let userdata of staffsdata){
            const user = await this.client.users.fetch(userdata.id).catch(() => {});
            const role = userdata.staff.role === "head-staff" ? "Head-Staff" : "Staff";
            staffs.push(user.tag + " (" + role + ")");
        }
        if(staffs.length === 0) staffs = ["Keine Staffs vorhanden"];

        const embed = this.client.createEmbed("Folgend sind alle Bot-Staffs aufgelistet:\n\n{0} {1}", "arrow", "normal", this.client.emotes.shine2, staffs.join("\n" + this.client.emotes.shine2 + " "));

        return this.message.reply({ embeds: [embed] });
    }
}
module.exports = Staffs;
