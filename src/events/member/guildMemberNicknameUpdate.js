module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "log";
    }

    getType() { return this.type }
    async dispatch(member, oldNickname, newNickname) {
        const { guild } = member;
        if(!guild) return;

        if(!newNickname) newNickname = member.user.username;
        const logText =
            " **Mitglied geupdated**\n\n" +
            this.client.emotes.arrow + "Mitglied: " + member.user.tag + "\n" +
            this.client.emotes.arrow + "Aktion: Nickname auf \"" + newNickname + "\" geändert";

        return guild.logAction(logText, "member", this.client.emotes.events.member.update, "normal", member.user.displayAvatarURL({ dynamic: true }));
    }
}