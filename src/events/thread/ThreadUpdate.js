module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(oldThread, newThread) {
        if (!newThread || !newThread.guild) return;
        const { guild } = newThread;

        const types = {
            11: "Öffentlicher Thread",
            12: "Privater Thread"
        }

        const logText =
            " **" + newThread.toString() + " wurde bearbeitet**\n\n" +
            this.client.emotes.arrow + " **Durchgeführte Änderungen:**";

        const changes = [];
        if(oldThread.name !== newThread.name) changes.push(this.client.emotes.edit + " Name von **" + oldThread.name + "** auf **" + newThread.name + "** geändert");
        if(oldThread.archived !== newThread.archived) changes.push(this.client.emotes.arrow + " " + (newThread.archived ? "Thread archiviert" : "Thread unarchiviert") + "**");
        if(oldThread.locked !== newThread.locked) changes.push(this.client.emotes.ban + " " + (newThread.locked ? "Thread gesperrt" : "Thread entsperrt"));
        if(oldThread.rateLimitPerUser !== newThread.rateLimitPerUser) changes.push(this.client.emotes.timeout + " Slow-Modus " + (oldThread.rateLimitPerUser ? "deaktiviert" : "aktiviert"));
        if(oldThread.type !== newThread.type) changes.push(this.client.emotes.list + " Typ von **" + types[oldThread.type] + "** auf **" + types[newThread.type] + "** geändert");

        if(changes.length === 0) return;

        return guild.logAction(logText + "\n" + changes.join("\n"), "thread", this.client.emotes.events.thread.update, "normal");
    }
}