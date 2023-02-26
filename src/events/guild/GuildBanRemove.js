module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(guildBan) {
        await guildBan.fetch().catch((e) => {})
        if(!guildBan || !guildBan.guild) return;
        const { guild } = guildBan;

        const logText =
            " **" + guildBan.user.tag + " wurde entbannt**";
        return guild.logAction(logText, "moderation", this.client.emotes.events.member.unban, "success", guildBan.user.displayAvatarURL({ dynamic: true }));
    }
}