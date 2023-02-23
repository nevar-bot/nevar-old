module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(guild) {
        const logText =
            " **Server geupdated**\n\n" +
            this.client.emotes.arrow + "Aktion: Server-Verifizierung wurde von Discord entfernt";

        return guild.logAction(logText, "guild", this.client.emotes.verified_server, "error", guild.iconURL());
    }
}