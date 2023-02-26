module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(oldEmoji, newEmoji) {
        if(!newEmoji || !oldEmoji || !newEmoji.guild) return;
        const { guild } = newEmoji;

        if(oldEmoji.name === newEmoji.name) return;

        const logText =
            " ** " + newEmoji.toString() + " wurde bearbeitet**\n\n" +
            this.client.emotes.arrow + " **Durchgeführte Änderungen:** \n" +
            this.client.emotes.edit + " Name von **" + oldEmoji.name + "** auf **" + newEmoji.name + "** geändert"

        return guild.logAction(logText, "guild", this.client.emotes.events.emoji.update, "normal", newEmoji.url);
    }
}