const BaseCommand = require('@structures/BaseCommand');
const interactionHandler = require('@handlers/registerInteractions');

class Updateinteractions extends BaseCommand {
    constructor(client){
        super(client, {
            name: "updateinteractions",
            description: "Updatet alle Slash-Commands und Kontext-Menüs",

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

        await this.updateInteractions();
    }

    async updateInteractions(){
        const res = await interactionHandler.init(this.client);
        if(res.state){
            const successEmbed = this.client.generateEmbed("Die Slash-Commands und Kontext-Menüs wurden aktualisiert.", "success", "success");
            return this.message.reply({ embeds:[successEmbed] });
        }else{
            const errorEmbed = this.client.generateEmbed("Beim Aktualisieren der Slash-Commands und Kontext-Menüs ist ein Fehler aufgetreten.", "error", "error");
            return this.message.reply({ embeds:[errorEmbed] });
        }
    }
}

module.exports = Updateinteractions;
