module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(oldSticker, newSticker) {
        if(!oldSticker || !newSticker || !newSticker.guild) return;
        const { guild } = newSticker;

        if(oldSticker.name === newSticker.name) return;

        const logText =
            " ** " + newSticker.name + " wurde bearbeitet**\n\n" +
            this.client.emotes.arrow + " **Durchgeführte Änderungen:** \n" +
            this.client.emotes.edit + " Name von **" + oldSticker.name + "** auf **" + newSticker.name + "** geändert"

        return guild.logAction(logText, "guild", this.client.emotes.events.sticker.update, "normal", newSticker.url);
    }
}