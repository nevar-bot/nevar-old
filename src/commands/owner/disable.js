const BaseCommand = require('@structures/BaseCommand');
const fs = require('fs');

class Disable extends BaseCommand {
    constructor(client){
        super(client, {
            name: "disable",
            description: "Deaktiviert einen Befehl",

            cooldown: 3000,
            ownerOnly: true,
            dirname: __dirname,

            slashCommand: {
                addCommand: false
            }
        });
    }

    static message;
    async dispatch(message, args, data){
        this.message = message;
        await this.disableCommand(args[0]);
    }

    async disableCommand(cmd){
        if(!cmd){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst einen Befehl angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        const command = this.client.commands.get(cmd);
        if(command){
            const disabledCommands = JSON.parse(fs.readFileSync("./assets/disabled.json"));

            if(disabledCommands.includes(command.help.name)){
                const alreadyDisabledEmbed = this.client.generateEmbed("Der Befehl ist bereits deaktiviert.", "error", "error");
                return this.message.reply({ embeds: [alreadyDisabledEmbed] });
            }

            disabledCommands.push(command.help.name);
            fs.writeFileSync("./assets/disabled.json", JSON.stringify(disabledCommands, null, 4));
            const disabledEmbed = this.client.generateEmbed("Der Befehl wurde deaktiviert.", "success", "success");
            return this.message.reply({ embeds: [disabledEmbed] });

        }else if(cmd.toLowerCase() === "list"){
            let disabledCommands = JSON.parse(fs.readFileSync("./assets/disabled.json"));
            if(disabledCommands.length === 0) disabledCommands = ["Keine Befehle deaktiviert"];
            const disabledListEmbed = this.client.generateEmbed("Folgende Befehle sind deaktiviert:\n\n{0} {1}", "success", "normal", this.client.emotes.arrow, disabledCommands.join("\n" + this.client.emotes.arrow + " "))
            return this.message.reply({ embeds: [disabledListEmbed] });
        }else{
            const invalidCommandEmbed = this.client.generateEmbed("Der Befehl existiert nicht.", "error", "error");
            return this.message.reply({ embeds: [invalidCommandEmbed] });
        }
    }
}

module.exports = Disable;
