module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(thread, newlyCreated){
        if(!thread || !thread.guild) return;
        const { guild } = thread;

        const types = {
            11: "Öffentlicher Thread",
            12: "Privater Thread"
        }
        const logText =
            " **" + thread.toString() + " wurde erstellt**\n\n" +
            this.client.emotes.edit + " Name: **" + thread.name + "**\n" +
            this.client.emotes.id + " ID: **" + thread.id + "**\n" +
            this.client.emotes.list + " Typ: **" + types[thread.type] + "**\n" +
            this.client.emotes.user + " Ersteller: **" + (await thread.fetchOwner()).user.tag + "**";

        return guild.logAction(logText, "thread", this.client.emotes.events.thread.create, "success");
    }
}