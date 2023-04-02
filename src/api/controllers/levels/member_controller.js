const levels = require('discord-xp');

async function get(req, res){
    const { app } = req;
    const { client } = require("@src/app");

    const guildId = req.params.guildID;
    const userId = req.params.memberID;

    if(!guildId || typeof guildId !== "string") return res.sendStatus(400);
    if(!userId || typeof userId !== "string") return res.sendStatus(400);

    const guild = client.guilds.cache.get(guildId);
    if(!guild) return res.sendStatus(404);

    if(!guild.members.cache.get(userId)) await guild.members.fetch(userId).catch(() => {});
    const member = guild.members.cache.get(userId);
    if(!member) return res.sendStatus(404);

    const levelUser = await levels.fetch(userId, guildId, true)
    if(!levelUser) return res.sendStatus(404);

    const jsonUser = {
        status_code: 200,
        status_message: null,
        res: {
            level: levelUser.level,
            xp: levelUser.xp,
            neededXp: levels.xpFor(levelUser.level+1),
            position: levelUser.position,
            tag: member.user.tag,
            userID: userId,
            guildID: guildId,
            avatar: member.user?.displayAvatarURL({size: 2048}) || 'https://brandlogos.net/wp-content/uploads/2021/11/discord-logo.png',
        }
    }

    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(jsonUser, null, 4));
}

module.exports = { get }