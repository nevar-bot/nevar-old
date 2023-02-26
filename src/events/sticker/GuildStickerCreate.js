module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(sticker) {
        await sticker.fetchUser().catch((e) => {});
        if(!sticker || !sticker.guild) return;
        const { guild } = sticker;

        const logText =
            " ** " + sticker.name + " wurde erstellt**\n\n" +
            this.client.emotes.edit + " Name: **" + sticker.name + "**\n" +
            this.client.emotes.id + " ID: **" + sticker.id + "**\n" +
            (sticker.user ? this.client.emotes.user + " Erstellt von: **" + sticker.user.tag + "**\n" : "");

        return guild.logAction(logText, "guild", this.client.emotes.events.sticker.create, "success", sticker.url);
    }
}