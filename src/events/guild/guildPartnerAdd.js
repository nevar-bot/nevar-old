module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(guild) {
        const logText =
            " **Server geupdated**\n\n" +
            this.client.emotes.arrow + "Aktion: Server wurde von Discord als Partner hinzugefügt";

        return guild.logAction(logText, "guild", this.client.emotes.events.guild.update, "success", guild.iconURL());
    }
}