module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(oldThread, newThread) {
        const { guild } = newThread;

        const logText =
            " **Thread geupdated**\n\n" +
            this.client.emotes.arrow + " Thread: " + newThread.name + "\n" +
            this.client.emotes.arrow + " Aktion: Thread " + (newThread.archived ? "archiviert" : "wiederhergestellt");

        return guild.logAction(logText, "thread", this.client.emotes.events.thread.update, "normal", guild.iconURL());
    }
}