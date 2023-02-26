module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async dispatch(oldChannel, newChannel) {
        if(!oldChannel || !newChannel || !newChannel.guild) return;
        const { guild } = newChannel;

        // Get all changes made
        const changes = [];
        if(oldChannel.name !== newChannel.name) changes.push(this.client.emotes.edit + " Name von **" + oldChannel.name + "** auf **" + newChannel.name + "** geändert");
        if(oldChannel.topic !== newChannel.topic) changes.push(this.client.emotes.quotes + " Thema " + (newChannel.topic ? "auf **" + newChannel.topic + "** geändert" : "zurückgesetzt"));
        if(oldChannel.nsfw !== newChannel.nsfw) changes.push(this.client.emotes.underage + " Altersbegrenzung " + (oldChannel.nsfw ? "deaktiviert" : "aktiviert"));
        if(oldChannel.parentId !== newChannel.parentId) changes.push(this.client.emotes.list + " Kategorie von **" + (oldChannel.parent?.name ? oldChannel.parent.name : "/")  + "** zu **" + (newChannel.parent?.name ? newChannel.parent.name : "/") + "** geändert");
        if(oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) changes.push(this.client.emotes.timeout + " Slow-Modus " + (oldChannel.rateLimitPerUser ? "deaktiviert" : "aktiviert"));
        if(oldChannel.bitrate !== newChannel.bitrate) changes.push(this.client.emotes.latency.good + " Bitrate von **" + oldChannel.bitrate/1000 + "kbps** auf **" + newChannel.bitrate/1000 + "kbps** geändert");
        if(oldChannel.userLimit !== newChannel.userLimit) changes.push(this.client.emotes.users + " Userlimit von **" + (oldChannel.userLimit === 0 ? "unbegrenzt" : oldChannel.userLimit) + "** auf **" + (newChannel.userLimit === 0 ? "unbegrenzt" : newChannel.userLimit) + "** geändert");
        if(oldChannel.videoQualityMode !== newChannel.videoQualityMode) changes.push(this.client.emotes.monitor + " Videoqualität von **" + (oldChannel.videoQualityMode === 1 ? "automatisch" : "720p") + "** auf **" + (newChannel.videoQualityMode === 1 ? "automatisch" : "720p") + "** geändert");

        if(changes.length < 1) return;

        const logText =
            " **" + newChannel.toString() + " wurde bearbeitet**\n\n" +
            this.client.emotes.arrow + " **Durchgeführte Änderungen:** \n" + changes.join("\n");

        return guild.logAction(logText, "channel", this.client.emotes.events.channel.update, "normal");
    }
}