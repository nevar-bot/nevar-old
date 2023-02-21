const levels = require('discord-xp');

exports.getLeaderBoard = async function(req, res){
    const { client } = require("@src/app");

    const guildId = req.params.guildID;
    let amount = req.params.amount;

    if(!guildId || typeof guildId !== "string") return res.sendStatus(400);

    const guild = client.guilds.cache.get(guildId);
    if(!guild) return res.sendStatus(404);

    if(!amount) amount = guild.memberCount || 10;
    let rawLeaderboard = await levels.fetchLeaderboard(guildId, amount);
    if(!rawLeaderboard) return res.sendStatus(404);

    const jsonLeaderboard = [];

    for(let entry of rawLeaderboard){
        const levelUser = await levels.fetch(entry.userID, entry.guildID, true)

        jsonLeaderboard.push({
            level: entry.level,
            xp: entry.xp,
            neededXp: levels.xpFor(entry.level+1),
            position: levelUser.position,
            tag: client.users.cache.get(entry.userID)?.tag || 'Unknown#0000',
            userID: entry.userID,
            guildID: entry.guildID,
            avatar: client.users.cache.get(entry.userID)?.displayAvatarURL({ size: 2048 }) || 'https://brandlogos.net/wp-content/uploads/2021/11/discord-logo.png',
        });
    }

    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(jsonLeaderboard, null, 4));
}

