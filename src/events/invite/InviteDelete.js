const moment = require("moment");
module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(invite) {
        if(!invite || !invite.guild) return;
        const { guild } = invite;

        // Update invites cache
        this.client.invites.get(invite.guild.id).delete(invite.code);

        // Remove invite from member data
        const memberData = await this.client.findOrCreateMember({ id: invite.inviter.id, guildID: invite.guild.id });
        if(!memberData.invites) memberData.invites = [];
        memberData.invites = memberData.invites.filter(i => i.code !== invite.code);
        memberData.markModified("invites");
        await memberData.save();

        const logText =
            " ** Einladung " + invite.code + " wurde gelöscht**";

        return guild.logAction(logText, "guild", this.client.emotes.events.guild.update, "error");
    }
}