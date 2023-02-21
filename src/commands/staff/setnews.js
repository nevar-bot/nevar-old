const BaseCommand = require('@structures/BaseCommand');
const fs = require('fs');

class Setnews extends BaseCommand {
    constructor(client){
        super(client, {
            name: "setnews",
            description: "Setze die neuste Ankündigung für den Bot.",

            cooldown: 3000,
            staffOnly: true,
            dirname: __dirname,

            slashCommand: {
                addCommand: false,
            }
        }); 
    }

    static message;
    async dispatch(message, args, data) {
        this.message = message;
        await this.setmessage(args.join(" "));
    }
    async setmessage(message) {

        let json = {
            timestamp: Date.now(),
            text: message
        };

        if (!fs.existsSync('./assets/news.json')) {
            const invalidFileEmbed = this.client.generateEmbed("Die Datei \"assets/news.json\" wurde nicht gefunden.", "error", "error");
            return this.message.reply({ embeds: [invalidFileEmbed] });
        }

        fs.writeFileSync('./assets/news.json', JSON.stringify(json, null, 4));
        const successEmbed = this.client.generateEmbed("Die Ankündigung wurde erfolgreich geändert.", "success", "success");
        return this.message.reply({ embeds: [successEmbed] });
    }
}

module.exports = Setnews;
