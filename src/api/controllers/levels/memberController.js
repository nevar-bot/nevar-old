const levels = require('discord-xp');

exports.getMember = async function(req, res) {
    const { client } = require("@src/app");

    const guildId = req.params.guildID;
    const userId = req.params.memberID;

    if(!guildId || typeof guildId !== "string") return res.sendStatus(400);
    if(!userId || typeof userId !== "string") return res.sendStatus(400);

    const guild = client.guilds.cache.get(guildId);
    if(!guild) return res.sendStatus(404);

    const member = guild.members.cache.get(userId);
    if(!member) return res.sendStatus(404);

    const levelUser = await levels.fetch(userId, guildId, true)
    if(!levelUser) return res.sendStatus(404);

    let jsonUser = {
        level: levelUser.level,
        xp: levelUser.xp,
        neededXp: levels.xpFor(levelUser.level+1),
        position: levelUser.position,
        tag: member.user.tag,
        userID: userId,
        guildID: guildId,
        avatar: member.user?.displayAvatarURL({size: 2048}) || 'https://brandlogos.net/wp-content/uploads/2021/11/discord-logo.png',
    }

    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(jsonUser, null, 4));
}