const { ChannelType } = require("discord.js");

async function get(req, res){
    const { app } = req;
    const { client } = require("@src/app");

    const json = {
        status_code: 200,
        status_message: null,
        res: {
            server_count: client.guilds.cache.size,
            shard_count: client.shard ? client.shard.count : 1,
            user_count: client.guilds.cache.reduce((sum, guild) => sum + (guild.available ? guild.memberCount : 0), 0),
            channel_count: client.channels.cache.size,
            support_url: client.config.support["INVITE"],
            invite_url: client.getInvite(),
        }
    }
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(json, null, 4));
}

module.exports = { get };