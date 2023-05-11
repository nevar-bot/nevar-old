const BaseCommand = require('@structures/BaseCommand');
const fs = require('fs');

class Enable extends BaseCommand {
    constructor(client){
        super(client, {
            name: "enable",
            description: "Aktiviert einen Befehl",

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
        await this.enableCommand(args[0]);
    }

    async enableCommand(cmd){
        if(!cmd){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst einen Befehl angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        const command = this.client.commands.get(cmd);
        if(command){
            let disabledCommands = JSON.parse(fs.readFileSync("./assets/disabled.json"));
            if(disabledCommands.includes(command.help.name)){
                disabledCommands = disabledCommands.filter(c => c !== command.help.name);
                fs.writeFileSync("./assets/disabled.json", JSON.stringify(disabledCommands, null, 4));

                const enabledEmbed = this.client.createEmbed("Der Befehl wurde aktiviert.", "success", "success");
                return this.message.reply({ embeds: [enabledEmbed] });
            }else{
                const isNotDisabledEmbed = this.client.createEmbed("Der Befehl ist nicht deaktiviert.", "error", "error");
                return this.message.reply({ embeds: [isNotDisabledEmbed] });
            }
        }else{
            const invalidCommandEmbed = this.client.createEmbed("Der Befehl existiert nicht.", "error", "error");
            return this.message.reply({ embeds: [invalidCommandEmbed] });
        }
    }
}

module.exports = Enable;
