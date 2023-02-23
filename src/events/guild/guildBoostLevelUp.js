module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(guild, oldLevel, newLevel) {
        const logText =
            " **Boost-Level gestiegen**\n\n" +
            this.client.emotes.arrow + "Aktion: Boost-Level von Level" + oldLevel + " auf " + newLevel + " gestiegen";

        return guild.logAction(logText, "guild", this.client.emotes.events.guild.update, "success", guild.iconURL());
    }
}