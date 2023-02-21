module.exports = {
    init(client){
        client.membersData.find({ "muted.state": true }).then((members) => {
            members.forEach((member) => {
                client.databaseCache.mutedUsers.set(member.id + member.guildID, member);
            });
        });
        setInterval(async () => {
            for (const memberData of [...client.databaseCache.mutedUsers.values()].filter((m) => m.muted.mutedUntil <= Date.now())) {

                const guild = client.guilds.cache.get(memberData.guildID);
                if(!guild) continue;

                let guildData = await client.findOrCreateGuild({id: memberData.guildID});
                if(!guildData) continue;

                let member = await guild.members.fetch(memberData.id);
                if(!member) continue;

                await member.roles.remove(guildData.settings.muterole, "Automatischer Unmute").catch((e) => {
                    // An mod log loggen
                });

                memberData.muted = {
                    state: false,
                    reason: null,
                    moderator: {
                        name: null,
                        id: null
                    },
                    duration: null,
                    mutedAt: null,
                    mutedUntil: null
                }
                memberData.markModified("muted");
                await memberData.save();
                client.databaseCache.mutedUsers.delete(memberData.id + memberData.guildID);
            }
        }, 1000);
    }
};
