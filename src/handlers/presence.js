const { ActivityType } = require("discord.js");

function updatePresence(client){
    const presences = client.config.presence;
    let presenceIndicator = 0;

    function update(){
        if(presenceIndicator === presences.length) presenceIndicator = 0;
        const presence = presences[presenceIndicator];

        let message = presence["MESSAGE"];
        message = message.replaceAll("{guilds}", client.guilds.cache.size);
        const members = client.guilds.cache.map((g) => g.memberCount).reduce((partial_sum, a) => partial_sum + a, 0);
        message = message.replaceAll("{users}", client.format(members));

        client.user.setPresence({
            status: presence["STATUS"],
            activities: [
                {
                    name: message,
                    type: ActivityType[presence["TYPE"]],
                    url: presence["URL"] ? presence["URL"] : null
                }
            ]
        });

        presenceIndicator++;
    }

    update();
    setInterval(() => {
        update();
    }, 30 * 1000);
}

module.exports = function handlePresence(client){
    updatePresence(client);
}