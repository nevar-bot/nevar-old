module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(role) {
        if(!role || !role.guild) return;
        const { guild } = role;

        const logText =
            " ** " + role.toString() + " wurde erstellt**\n\n" +
            this.client.emotes.arrow + " Name: **" + role.name + "**\n" +
            this.client.emotes.arrow + " ID: **" + role.id + "**";

        return guild.logAction(logText, "role", this.client.emotes.events.role.create, "success");
    }
}