module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(emoji) {
        await emoji.fetchAuthor().catch((e) => {});
        if(!emoji || !emoji.guild) return;
        const { guild } = emoji;

        const logText =
            " ** " + emoji.toString() + " wurde erstellt**\n\n" +
            this.client.emotes.arrow + " Name: **" + emoji.name + "**\n" +
            this.client.emotes.arrow + " ID: **" + emoji.id + "**\n" +
            (emoji.author ? this.client.emotes.arrow + " Erstellt von: **" + emoji.author.tag + "**\n" : "");

        return guild.logAction(logText, "guild", this.client.emotes.events.emoji.create, "success", emoji.url);
    }
}