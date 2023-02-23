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
            " **Neuer Booster**\n\n" +
            this.client.emotes.arrow + "Mitglied: " + member.user.tag + "\n" +
            this.client.emotes.arrow + "Aktion: Boostet den Server jetzt";

        return guild.logAction(logText, "guild", this.client.emotes.events.member.update, "success", member.user.displayAvatarURL({ dynamic: true }));
    }
}