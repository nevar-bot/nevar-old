const BaseCommand = require('@structures/BaseCommand');

class Reload extends BaseCommand {
    constructor(client){
        super(client, {
            name: "reload",
            description: "Lädt einen Befehl neu",

            cooldown: 3000,
            ownerOnly: true,
            dirname: __dirname,

            slashCommand: {
                addCommand: false,
            }
        });
    }

    static message;
    async dispatch(message, args, data){
        this.message = message;
        await this.reloadCommand(args[0]);
    }

    async reloadCommand(cmd){
        if(!cmd){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst einen Befehl angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        const command = this.client.commands.get(cmd);
        if(command){
            await this.client.unloadCommand(command.conf.location, command.help.name);
            await this.client.loadCommand(command.conf.location, command.help.name);

            const reloadEmbed = this.client.generateEmbed("Der Befehl wurde neugeladen.", "success", "success");
            return this.message.reply({ embeds: [reloadEmbed] });
        }else{
            const invalidCommandEmbed = this.client.generateEmbed("Der Befehl existiert nicht.", "error", "error");
            return this.message.reply({ embeds: [invalidCommandEmbed] });
        }
    }
}

module.exports = Reload;
