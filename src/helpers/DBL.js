const { createDjsClient } = require("discordbotlist");
const axios = require("axios");
const schedule = require("node-schedule");

module.exports = {
    init(client) {
        if (client.config.apikeys["DBL"] && client.config.apikeys["DBL"] !== "" && client.config.channels["VOTE_ANNOUNCEMENT_ID"] && client.config.channels["VOTE_ANNOUNCEMENT_ID"] !== "") {
            //Post bot stats to discordbotlist.com every 10 minutes
            const dbl = createDjsClient(client.config.apikeys["DBL"], client);
            dbl.startPosting(10 * 60 * 1000);

            schedule.scheduleJob('0 0 * * *', async () => {
                const clientCommands = [];
                for(let command of client.commands.values()) clientCommands.push({ name: command.help.name, description: command.help.description, type: 1 });
                for(let context of client.contextMenus.values()) clientCommands.push({ name: context.help.name, description: null, type: context.help.type });

                const config = {
                    method: "post",
                    url: "https://discordbotlist.com/api/v1/bots/" + client.user.id + "/commands",
                    headers: {
                        "Authorization": client.config.apikeys["DBL"],
                        "Content-Type": "application/json",
                        "User-Agent": "Nevar-Client"
                    },
                    data: JSON.stringify(clientCommands)
                };

                await axios(config).catch((e) => console.log(e));
            });
        }
    }
};
