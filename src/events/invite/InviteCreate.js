const moment = require("moment");
module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(invite) {
        if(!invite || !invite.guild) return;
        const { guild } = invite;

        const logText =
            " ** Einladung " + invite.code + " wurde erstellt**\n\n" +
            this.client.emotes.link + " Link: **" + invite.url + "**\n" +
            this.client.emotes.user + " Erstellt von: **" + invite.inviter.tag + "**\n" +
            this.client.emotes.reload + " Maximale Verwendungen: ** " + (invite.maxUses === 0 ? "Unbegrenzt" : invite.maxUses)  + "**\n" +
            (invite.expiresTimestamp ? this.client.emotes.reminder + " Ablaufdatum: **" + moment(invite.expiresTimestamp).format("DD.MM.YYYY HH:mm") + "**" : "");

        return guild.logAction(logText, "guild", this.client.emotes.events.guild.update, "success");
    }
}