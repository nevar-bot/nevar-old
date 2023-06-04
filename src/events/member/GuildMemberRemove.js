module.exports = class {
    constructor(client){
        this.client = client;
    }
    async dispatch(member){
        if(!member || !member.id || !member.guild) return;
        const guild = member.guild;

        const guildData = await this.client.findOrCreateGuild({
            id: guild.id
        });

        // Update invite cache
        const memberData = await this.client.findOrCreateMember({ id: member.id, guildID: guild.id });
        if(memberData.inviteUsed){
            const invite = await guild.invites.fetch(memberData.inviteUsed).catch(() => {});
            if(invite){
                const inviterData = await this.client.findOrCreateMember({ id: invite.inviterId, guildID: guild.id });
                if(!inviterData.invites) inviterData.invites = [];
                inviterData.invites.find(i => i.code === invite.code).left++;
                inviterData.markModified("invites");
                await inviterData.save();
            }
        }

        // Log to member log
        const logText =
            " **" + member.user.tag + " hat den Server verlassen**";

        await guild.logAction(logText, "guild", this.client.emotes.events.member.ban, "error", member.user.displayAvatarURL({ dynamic: true }));

        if(guildData.settings?.farewell.enabled){
            function parseMessage(str){
                return str
                    .replaceAll(/{user}/g, member)
                    .replaceAll(/{user:username}/g, member.user.username)
                    .replaceAll(/{user:tag}/g, member.user.tag)
                    .replaceAll(/{user:discriminator}/g, member.user.discriminator)
                    .replaceAll(/{user:id}/g, member.user.id)
                    .replaceAll(/{server:name}/g, guild.name)
                    .replaceAll(/{server:id}/g, guild.id)
                    .replaceAll(/{server:membercount}/g, guild.memberCount)
                    .replaceAll(/{newline}/g, "\n");
            }
            const goodbyeMessage = parseMessage(guildData.settings.farewell.message);
            const goodbyeChannel = guild.channels.cache.get(guildData.settings.farewell.channel) || await guild.channels.fetch(guildData.settings.farewell.channel).catch(() => {});
            if(!goodbyeChannel) {
                const desc =
                    " **Senden von Verabschiedungsnachricht fehlgeschlagen, da der Channel nicht gefunden wurde**";
                return guild.logAction(desc, "guild", this.client.emotes.error, "error");
            }

            if(guildData.settings.farewell.type === "embed"){
                const goodbyeEmbed = this.client.createEmbed("{0}", null, "normal", goodbyeMessage);
                goodbyeEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
                return goodbyeChannel.send({ embeds: [goodbyeEmbed] }).catch((e) => {
                    const desc =
                        " **Senden von Verabschiedungsnachricht fehlgeschlagen**";
                    return guild.logAction(desc, "guild", this.client.emotes.error, "error");
                });
            }else if(guildData.settings.welcome.type === "text"){
                return goodbyeChannel.send({ content: goodbyeMessage }).catch((e) => {
                    const desc =
                        " **Senden von Verabschiedungsnachricht fehlgeschlagen**";
                    return guild.logAction(desc, "guild", this.client.emotes.error, "error");
                });
            }
        }
    }
}
