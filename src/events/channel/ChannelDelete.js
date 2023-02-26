module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "client";
    }

    getType() { return this.type }
    async dispatch(channel) {
        if(!channel || !channel.guild) return;
        const { guild } = channel;

        const properties = [];
        if(channel.id) properties.push(this.client.emotes.id + " ID: " + channel.id);
        if(channel.topic) properties.push(this.client.emotes.quotes + " Thema: **" + channel.topic + "**");
        if(channel.nsfw) properties.push(this.client.emotes.underage + " Altersbegrenzung: **" + (channel.nsfw ? "aktiviert" : "deaktiviert") + "**");
        if(channel.bitrate) properties.push(this.client.emotes.latency.good + " Bitrate: **" + channel.bitrate/1000 + "kbps**");
        if(channel.userLimit) properties.push(this.client.emotes.users + " Userlimit: **" + (channel.userLimit === 0 ? "unbegrenzt" : channel.userLimit) + "**");
        if(channel.videoQualityMode) properties.push(this.client.emotes.monitor + " Videoqualität: **" + (channel.videoQualityMode === 1 ? "automatisch" : "720p") + "**");
        if(properties.length < 1) return;

        const logText =
            " **" + channel.name + " wurde gelöscht**\n\n" +
            this.client.emotes.arrow + " **Eigenschaften:** \n" + properties.join("\n");

        return guild.logAction(logText, "channel", this.client.emotes.events.channel.delete, "error");
    }
}