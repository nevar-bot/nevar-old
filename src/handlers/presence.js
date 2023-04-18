const { ActivityType } = require("discord.js");

function updatePresence(client){
    const presences = client.config.presence;
    let presenceIndicator = 0;

    function update(){
        if(presenceIndicator === presences.length) presenceIndicator = 0;
        const presence = presences[presenceIndicator];

        const message = presence["MESSAGE"]
            .replaceAll("{guilds}", client.format(client.guilds.cache.size))
            .replaceAll("{users}", client.format(client.guilds.cache.map((g) => g.memberCount).reduce((partial_sum, a) => partial_sum + a, 0)));

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