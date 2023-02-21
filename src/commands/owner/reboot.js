const BaseCommand = require('@structures/BaseCommand');

class Reboot extends BaseCommand {
    constructor(client){
        super(client, {
            name: "reboot",
            description: "Startet den Bot neu",

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
        await this.reboot();
    }

    async reboot(){
        const rebootEmbed = this.client.generateEmbed("Der Bot wird neu gestartet...", "warning", "warning", );
        await this.message.reply({ embeds: [rebootEmbed] });
        process.exit(1);
    }
}

module.exports = Reboot;
