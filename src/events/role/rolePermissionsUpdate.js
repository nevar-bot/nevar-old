module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(role, oldPermissions, newPermissions) {
        const { guild } = role;

        const logText =
            " **Rolle geupdated**\n\n" +
            this.client.emotes.arrow + " Rolle: " + role.toString() + "\n" +
            this.client.emotes.arrow + " Aktion: Berechtigungen geändert";

        return guild.logAction(logText, "role", this.client.emotes.events.role.update, "normal", guild.iconURL());
    }
}