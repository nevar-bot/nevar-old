const levels = require('discord-xp');

async function get(req, res){
    const { app } = req;
    const { client } = require("@src/app");

    const guildId = req.params.guildID;
    const amount = req.params.amount || 10;

    if(!guildId || !amount || typeof guildId !== "string" || typeof Number(amount) !== "number") return res.sendStatus(400);

    const guild = client.guilds.cache.get(guildId);
    if(!guild) return res.sendStatus(404);

    const rawLeaderboard = await levels.fetchLeaderboard(guildId, amount);
    if(!rawLeaderboard) return res.sendStatus(404);

    const jsonLeaderboard = [];

    for(let entry of rawLeaderboard){
        const levelUser = await levels.fetch(entry.userID, entry.guildID, true)
        if(!client.users.cache.get(entry.userID)) await client.users.fetch(entry.userID).catch(() => {});
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

    const json = {
        status_code: 200,
        status_message: null,
        res: {
            guild_id: guildId,
            guild_name: guild.name,
            guild_icon: guild.iconURL({ size: 2048 }),
            leaderboard: jsonLeaderboard
        }
    }
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(json, null, 4));
}

module.exports = { get }
