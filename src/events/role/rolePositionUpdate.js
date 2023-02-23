module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(role, oldPosition, newPosition) {
        const { guild } = role;

        const logText =
            " **Rolle geupdated**\n\n" +
            this.client.emotes.arrow + " Rolle: " + role.toString() + "\n" +
            this.client.emotes.arrow + " Aktion: Position von " + oldPosition + " auf " + newPosition + " geändert";

        return guild.logAction(logText, "role", this.client.emotes.events.role.update, "normal", guild.iconURL());
    }
}