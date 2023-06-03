const moment = require("moment");
module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(invite) {
        if(!invite || !invite.guild || !invite.inviter) return;
        const { guild } = invite;

        // Update invites cache
        this.client.invites.get(invite.guild.id).set(invite.code, invite.uses);

        // Add invite to member data
        const memberData = await this.client.findOrCreateMember({ id: invite.inviter.id, guildID: invite.guild.id });
        if(!memberData.invites) memberData.invites = [];
        memberData.invites.push({
            code: invite.code,
            uses: invite.uses,
            fake: 0
        });
        memberData.markModified("invites");
        await memberData.save();

        const logText =
            " ** Einladung " + invite.code + " wurde erstellt**\n\n" +
            this.client.emotes.link + " Link: **" + invite.url + "**\n" +
            this.client.emotes.user + " Erstellt von: **" + (invite.inviter?.tag ? invite.inviter.tag : "Unbekannt#0000") + "**\n" +
            this.client.emotes.reload + " Maximale Verwendungen: ** " + (invite.maxUses === 0 ? "Unbegrenzt" : invite.maxUses)  + "**\n" +
            (invite.expiresTimestamp ? this.client.emotes.reminder + " Ablaufdatum: **" + moment(invite.expiresTimestamp).format("DD.MM.YYYY HH:mm") + "**" : "");

        return guild.logAction(logText, "guild", this.client.emotes.events.guild.update, "success");
    }
}