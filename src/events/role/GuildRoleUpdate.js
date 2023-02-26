module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(oldRole, newRole) {
        if(!oldRole || !newRole || !newRole.guild) return;
        const { guild } = newRole;

        const changes = [];
        if(oldRole.color !== newRole.color) changes.push(this.client.emotes.settings + " Farbe von **" + oldRole.hexColor + "** auf **" + newRole.hexColor + "** geändert");
        if(oldRole.name !== newRole.name) changes.push(this.client.emotes.edit + " Name von **" + oldRole.name + "** auf **" + newRole.name + "** geändert");

        const logText =
            " ** " + newRole.toString() + " wurde bearbeitet**\n\n" +
            this.client.emotes.arrow + " **Durchgeführte Änderungen:** \n" + changes.join("\n");

        if(changes.length === 0) return;

        return guild.logAction(logText, "role", this.client.emotes.events.role.update, "normal");
    }
}