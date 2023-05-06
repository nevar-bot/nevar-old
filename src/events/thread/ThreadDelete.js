module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(thread){
        if(!thread || !thread.guild) return;
        const { guild } = thread;

        const types = {
            11: "Öffentlicher Thread",
            12: "Privater Thread"
        }

        const logText =
            " **" + thread.name + " wurde gelöscht**\n\n" +
            this.client.emotes.edit + " Name: **" + thread.name + "**\n" +
            this.client.emotes.id + " ID: **" + thread.id + "**\n" +
            this.client.emotes.list + " Typ: **" + types[thread.type] + "**";
        return guild.logAction(logText, "thread", this.client.emotes.events.thread.delete, "error");
    }
}