const BaseCommand = require('@structures/BaseCommand');
const { exec } = require('child_process');

class Pull extends BaseCommand {
    constructor(client){
        super(client, {
            name: "pull",
            description: "Pullt den aktuellen Sourcecode von GitHub",

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
        const pullEmbed = this.client.createEmbed("Starte Pull...", "warning", "warning", );
        const repliedMessage = await this.message.reply({ embeds: [pullEmbed] });

        exec('git pull', (err, stdout, stderr) => {
            if (err) {
                const errorEmbed = this.client.createEmbed(`Beim Pullen ist ein Fehler aufgetreten:\`\`\`${err}\`\`\``, "error", "error", );
                return repliedMessage.update({ embeds: [errorEmbed] });
            }
            const successEmbed = this.client.createEmbed("Pull erfolgreich, starte neu...", "success", "success");
            repliedMessage.update({ embeds: [successEmbed] })
                .then(() => {
                    process.exit(1);
                });
        });
    }
}

module.exports = Pull;
