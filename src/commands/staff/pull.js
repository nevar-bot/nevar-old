const BaseCommand = require('@structures/BaseCommand');

class Pull extends BaseCommand {
    constructor(client){
        super(client, {
            name: "pull",
            description: "Pull den neuen Code von GitHub und starte den Bot neu.",

            cooldown: 3000,
            staffOnly: true,
            dirname: __dirname,

            slashCommand: {
                addCommand: false,
            }
        });
    }

    static message;
    async dispatch(message, args, data){
        this.message = message;
        await this.pull();
    }

    async pull(){
        const pullEmbed = this.client.createEmbed("Es wird von GitHub gepullt..", "warning", "warning", );
        this.message.reply({ embeds: [pullEmbed] });
        const { exec } = require('child_process');
        exec('git pull', (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                let errorEmbed = this.client.createEmbed(`Es ist ein Fehler aufgetreten!\`\`\`${err}\`\`\``, "error", "error", );
                this.message.reply({ embeds: [errorEmbed] });
                return;
            }
            let successEmbed = this.client.createEmbed("Erfolgreich von GitHub gepullt! Der Bot wird jetzt neugestartet.", "success", "success", );
            this.message.reply({ embeds: [successEmbed] });
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        });
    }
}

module.exports = Pull;
