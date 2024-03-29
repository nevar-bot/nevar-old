module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async dispatch(message, data, guild) {
        const since = data.user.afk.since;
        const afkReason = data.user.afk.reason;

        data.user.afk = {
            state: false,
            reason: null,
            since: null
        };
        data.user.markModified("afk");
        await data.user.save();

        const afkSinceString = this.client.utils.getRelativeTime(since);

        const text =
            "Willkommen zurück!\n\n" +
            this.client.emotes.arrow + " Du warst **" + afkSinceString + "** weg: " + (afkReason || "Kein Grund angegeben");

        const welcomeBackEmbed = this.client.createEmbed("{0}", "reminder", "normal", text);
        return message.reply({ embeds: [welcomeBackEmbed] }).catch(() => {});
    }
}