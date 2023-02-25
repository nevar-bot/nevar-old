module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(oldGuild, newGuild) {
        const newOwner = await this.client.users.fetch(newGuild.ownerId).catch((e) => {
            this.client.logException(e, newGuild.name, null, "<this>.users.fetch(\"" + newGuild.ownerId + "\"");
        });
        const logText =
            " **Server geupdated**\n\n" +
            this.client.emotes.arrow + "Aktion: Eigentümer auf " + newOwner.tag + " geändert";

        return newGuild.logAction(logText, "guild", this.client.emotes.events.guild.update, "normal", newGuild.iconURL());
    }
}