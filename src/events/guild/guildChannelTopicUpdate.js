module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(channel, oldTopic, newTopic) {
        const { guild } = channel;
        if(!guild) return;

        const logText =
            " **Channel geupdated**\n\n" +
            this.client.emotes.arrow + "Channel: " + channel.toString() + "\n" +
            this.client.emotes.arrow + "Aktion: Thema auf \"" + newTopic + "\" geändert";

        return guild.logAction(logText, "channel", this.client.emotes.events.channel.update, "normal", guild.iconURL());
    }
}