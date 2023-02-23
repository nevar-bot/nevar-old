module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(thread, oldName, newName) {
        const { guild } = thread;

        const logText =
            " **Thread geupdated**\n\n" +
            this.client.emotes.arrow + " Thread: " + thread.name + "\n" +
            this.client.emotes.arrow + " Aktion: Thread-Name auf \"" + newName + "\" geändert";

        return guild.logAction(logText, "thread", this.client.emotes.events.thread.update, "normal", guild.iconURL());
    }
}