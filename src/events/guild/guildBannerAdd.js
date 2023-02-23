module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(guild, bannerURL) {
        const logText =
            " **Server geupdated**\n\n" +
            this.client.emotes.arrow + "Aktion: Server-Banner geändert:" + bannerURL;

        return guild.logAction(logText, "guild", this.client.emotes.events.guild.update, "normal", guild.iconURL());
    }
}