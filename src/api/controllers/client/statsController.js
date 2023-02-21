const { ChannelType } = require("discord.js");
exports.getStats = async function(req, res) {
    const {client} = require("@src/app");

    const json = {
        server_count: client.guilds.cache.size,
        shard_count: client.shard ? client.shard.count : 1,
        user_count: client.guilds.cache.reduce((sum, guild) => sum + (guild.available ? guild.memberCount : 0), 0),
        channel_count: {
            total: client.channels.cache.filter(c => (c.type === ChannelType["GuildText"]) || (c.type === ChannelType["GuildNews"]) || (c.type === ChannelType["GuildVoice"])).size,
            text: client.channels.cache.filter(c => (c.type === ChannelType["GuildText"]) || (c.type === ChannelType["GuildNews"])).size,
            voice: client.channels.cache.filter(c => c.type === ChannelType["GuildVoice"]).size,
        },
        command_count: client.commands.size,
        support_url: client.config.support["INVITE"],
        invite_url: client.getInvite(),
    }
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(json, null, 4));
}