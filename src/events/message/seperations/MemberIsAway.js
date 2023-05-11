module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async dispatch(message, data, guild) {
        let afkUsers = [];

        if(message.mentions.repliedUser) {
            const mentionData = await this.client.findOrCreateUser({ id: message.mentions.repliedUser.id });

            if(mentionData.afk?.state){
                const afkSince = this.client.utils.getRelativeTime(mentionData.afk.since);
                afkUsers = afkUsers.filter(u => u.id !== message.mentions.repliedUser.id);

                afkUsers.push({
                    name: message.mentions.repliedUser.username,
                    id: message.mentions.repliedUser.id,
                    reason: mentionData.afk.reason || "Kein Grund angegeben",
                    since: afkSince
                });
            }

        }

        if(message.mentions.users){
            const users = Array.from(message.mentions.users);

            for(let user of users){
                const mentionData = await this.client.findOrCreateUser({ id: user[1].id });

                if(mentionData.afk?.state){
                   const afkSince = this.client.utils.getRelativeTime(mentionData.afk.since);
                    afkUsers = afkUsers.filter((u) => u.id !== user[1].id);
                    afkUsers.push({
                        name: user[1].username,
                        id: user[1].id,
                        reason: mentionData.afk.reason,
                        since: afkSince
                    });
                }
            }
        }
        for(let afkUser of afkUsers){
            const text =
                afkUser.name + " ist aktuell abwesend!\n\n" +
                this.client.emotes.arrow + " Grund: " + afkUser.reason + "\n" +
                this.client.emotes.arrow + " Abwesend seit: " + afkUser.since;

            const isAwayEmbed = this.client.createEmbed("{0}", "reminder", "normal", text);
            await message.reply({ embeds: [isAwayEmbed] }).catch(() => {});
        }
    }
}