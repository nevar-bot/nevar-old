module.exports = {
    init(client){
        client.membersData.find({ "banned.state": true }).then((members) => {
            members.forEach((member) => {
                client.databaseCache.bannedUsers.set(member.id + member.guildID, member);
            });
        });
        setInterval(async () => {
            for (const memberData of [...client.databaseCache.bannedUsers.values()].filter((m) => m.banned.bannedUntil <= Date.now())) {

                const guild = client.guilds.cache.get(memberData.guildID);
                if(!guild) continue;

                guild.members.unban(memberData.id, "Automatischer Unban").catch((e) => {
                    const desc =
                        "Automatischer Unban fehlgeschlagen\n\n" +
                        client.emotes.arrow + " Nutzer: " + memberData.id + "\n" +
                        client.emotes.arrow + " Aktion: Automatischer Unban";
                    guild.logAction(desc, "moderation", "error", "error", null);
                });

                memberData.banned = {
                    state: false,
                    reason: null,
                    moderator: {
                        name: null,
                        id: null,
                    },
                    duration: null,
                    bannedAt: null,
                    bannedUntil: null
                }
                memberData.markModified("banned");
                await memberData.save();
                client.databaseCache.bannedUsers.delete(memberData.id + memberData.guildID);
            }
        }, 1000);
    }
};
