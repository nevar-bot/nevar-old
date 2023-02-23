module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(member, role) {
        const { guild } = member;
        if(!guild) return;

        const logText =
            " **Mitglied geupdated**\n\n" +
            this.client.emotes.arrow + "Mitglied: " + member.user.tag + "\n" +
            this.client.emotes.arrow + "Aktion: " + role.toString() + " Rolle entfernt";

        return guild.logAction(logText, "member", this.client.emotes.events.member.update, "error", member.user.displayAvatarURL({ dynamic: true }));
    }
}