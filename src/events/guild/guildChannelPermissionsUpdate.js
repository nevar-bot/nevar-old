module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(channel, oldPermissions, newPermissions) {
        const { guild } = channel;
        if(!guild) return;

        const logText =
            " **Channel geupdated**\n\n" +
            this.client.emotes.arrow + "Channel: " + channel.toString() + "\n" +
            this.client.emotes.arrow + "Aktion: Berechtigungen geändert";

        return guild.logAction(logText, "channel", this.client.emotes.events.channel.update, "normal", guild.iconURL());
    }
}