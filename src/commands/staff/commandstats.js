const BaseCommand = require('@structures/BaseCommand');
const mongoose = require("mongoose");

class Commandstats extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "commandstats",
            description: "Zeigt wie oft ein Befehl ausgeführt wurde",

            cooldown: 3000,
            staffOnly: true,
            dirname: __dirname,

            slashCommand: {
                addCommand: false
            }
        });
    }


    static message;
    async dispatch(message, args, data) {
        this.message = message;
        await this.sendStats(args);
    }

    async sendStats(args){
        if(!args[0]){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst einen Befehl angeben.", "error", "normal");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        const command = this.client.commands.get(args[0]);
        if(!command){
            const invalidCommandEmbed = this.client.createEmbed("Der Befehl existiert nicht.", "error", "normal");
            return this.message.reply({ embeds: [invalidCommandEmbed] });
        }

        const executedCommands = (await (await mongoose.connection.db.collection("logs").find({ "command": command.help.name })).toArray()).length;

        const statsEmbed = this.client.createEmbed("Der {0}-Command wurde {1}x ausgeführt.", "arrow", "normal", command.help.name, executedCommands);
        return this.message.reply({ embeds: [statsEmbed] });
    }
}
module.exports = Commandstats;
