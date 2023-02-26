module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(role) {
        if(!role || !role.guild) return;
        const { guild } = role;

        const logText =
            " ** @" + role.name + " wurde gelöscht**\n\n" +
            this.client.emotes.arrow + " Name: **" + role.name + "**\n" +
            this.client.emotes.arrow + " ID: **" + role.id + "**";

        return guild.logAction(logText, "guild", this.client.emotes.events.role.delete, "error");
    }
}