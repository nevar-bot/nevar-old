const moment = require("moment");
module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(invite) {
        if(!invite || !invite.guild) return;
        const { guild } = invite;

        const logText =
            " ** Einladung " + invite.code + " wurde gelöscht**";

        return guild.logAction(logText, "guild", this.client.emotes.events.guild.update, "error");
    }
}