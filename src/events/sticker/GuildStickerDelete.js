module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(sticker) {
        if(!sticker || !sticker.guild) return;
        const { guild } = sticker;

        const logText =
            " ** " + sticker.name + " wurde gelöscht**\n\n" +
            this.client.emotes.arrow + " Name: **" + sticker.name + "**\n" +
            this.client.emotes.arrow + " ID: **" + sticker.id + "**";

        return guild.logAction(logText, "guild", this.client.emotes.events.sticker.delete, "error", sticker.url);
    }
}