module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(emoji) {
        if(!emoji || !emoji.guild) return;
        const { guild } = emoji;

        const logText =
            " ** " + emoji.toString() + " wurde gelöscht**\n\n" +
            this.client.emotes.arrow + " Name: **" + emoji.name + "**\n" +
            this.client.emotes.arrow + " ID: **" + emoji.id + "**";

        return guild.logAction(logText, "guild", this.client.emotes.events.emoji.delete, "error", emoji.url);
    }
}