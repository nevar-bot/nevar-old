const BaseCommand = require('@structures/BaseCommand');

class Serverlist extends BaseCommand {
    constructor(client){
        super(client, {
            name: "serverlist",
            description: "Sendet die Serverliste",

            cooldown: 3000,
            staffOnly: true,
            dirname: __dirname,

            slashCommand: {
                addCommand: false
            }
        });
    }

    static message;
    async dispatch(message, args, data){
        this.message = message;

        await this.showServerList();
    }

    async showServerList(){
        const servers = [];

        for(let guild of this.client.guilds.cache){
            const text =
                " **" + guild[1].name + "**\n" +
                this.client.emotes.arrow + " Mitglieder: " + guild[1].memberCount + "\n" +
                this.client.emotes.arrow + " ID: " + guild[1].id + "\n";
            servers.push(text);
        }

        await this.client.utils.sendPaginatedEmbedMessage(this.message, 5, servers, "Serverliste", "Der Bot ist auf keinem Server", "discord");
    }
}

module.exports = Serverlist;
