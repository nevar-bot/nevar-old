module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(member) {
        const { guild } = member;
        if(!guild) return;

        const logText =
            " **Booster verloren**\n\n" +
            this.client.emotes.arrow + "Mitglied: " + member.user.tag + "\n" +
            this.client.emotes.arrow + "Aktion: Boostet den Server nicht mehr";

        return guild.logAction(logText, "guild", this.client.emotes.events.member.update, "error", member.user.displayAvatarURL({ dynamic: true }));
    }
}