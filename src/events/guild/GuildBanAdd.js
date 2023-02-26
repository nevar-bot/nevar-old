module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(guildBan) {
        await guildBan.fetch().catch((e) => {})
        if(!guildBan || !guildBan.guild) return;
        const { guild } = guildBan;

        const logText =
            " **" + guildBan.user.tag + " wurde gebannt**\n\n" +
            this.client.emotes.arrow + " Grund: **" + (guildBan.reason ? guildBan.reason : "Kein Grund angegeben") + "**";
        return guild.logAction(logText, "moderation", this.client.emotes.events.member.ban, "error", guildBan.user.displayAvatarURL({ dynamic: true }));
    }
}