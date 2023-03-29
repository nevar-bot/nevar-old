const { createDjsClient } = require("discordbotlist");
const axios = require("axios");

module.exports = {
    init(client) {
        if (client.config.apikeys["DBL"] && client.config.apikeys["DBL"] !== "" && client.config.channels["VOTE_ANNOUNCEMENT_ID"] && client.config.channels["VOTE_ANNOUNCEMENT_ID"] !== "") {
            //Post bot stats to discordbotlist.com every 10 minutes
            const dbl = createDjsClient(client.config.apikeys["DBL"], client);
            dbl.startPosting(10 * 60 * 1000);

            setInterval(async () => {
                const clientCommands = [];
                for(let command of client.commands.values()){
                    if(command.help.category === "owner" || command.help.category === "staff") continue;
                    clientCommands.push({
                        name: command.help.name,
                        description: command.help.description,
                        type: 1
                    });
                }
                for(let contextMenu of client.contextMenus.values()){
                    clientCommands.push({
                        name: contextMenu.help.name,
                        description: null,
                        type: contextMenu.help.type,
                    });
                }

                const config = {
                    method: 'post',
                    url: 'https://discordbotlist.com/api/v1/bots/860229767991263242/commands',
                    headers: {
                        'Authorization': client.config.apikeys["DBL"],
                        'Content-Type': 'application/json',
                        'User-Agent': 'Nevar-Client'
                    },
                    data : JSON.stringify(clientCommands)
                };

                await axios(config).catch((e) => console.log(e));
            }, 600000)
        }
    }
};
