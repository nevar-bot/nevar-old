const moment = require("moment/moment");
const {Collection} = require("discord.js");
module.exports = class {
    constructor(client){
        this.client = client;
    }
    async dispatch(member){
        if(!member || !member.id || !member.guild || member.pending) return;
        const guild = member.guild;

        const guildData = await this.client.findOrCreateGuild({
            id: guild.id
        });

        const memberData = await this.client.findOrCreateMember({
            id: member.user.id,
            guildID: guild.id
        });

        // Get inviter
        const newInvites = await member.guild.invites.fetch().catch(() => {});
        const oldInvites = this.client.invites.get(member.guild.id);
        const invite = newInvites.find(i => i.uses > oldInvites.get(i.code));
        const inviter = await this.client.users.fetch(invite.inviter.id).catch(() => {});
        guild.invites.fetch().then((invites) => {
            this.client.invites.set(guild.id, new Collection(invites.map((invite) => [invite.code, invite.uses])));
        });
        if(invite) memberData.inviteUsed = invite.code;

        // Log to member log
        const createdAt = moment(member.user.createdTimestamp).format("DD.MM.YYYY HH:mm");
        const createdDiff = this.client.utils.getRelativeTime(member.user.createdTimestamp);

        const logText =
            " **" + member.user.tag + " hat den Server betreten**\n\n" +
            this.client.emotes.calendar + " Account erstellt am: **" + createdAt + "**\n" +
            this.client.emotes.reminder + " Account erstellt vor: **" + createdDiff + "**\n" +
            (inviter ? this.client.emotes.invite + " Eingeladen von: **" + inviter.tag + "**" : "");

        await guild.logAction(logText, "guild", this.client.emotes.events.member.unban, "success", member.user.displayAvatarURL({ dynamic: true }));

        // User is muted
        if(memberData.muted?.state){
            member.roles.add(guildData.settings.muterole).catch(async (e) => {
                const desc =
                    "**Automatischer Mute von " + member.user.tag + " fehlgeschlagen**\n\n" +
                    this.client.emotes.arrow + " Mitglied welches gemuted war konnte nach Rejoin die Mute-Rolle nicht automatisch zugewiesen werden";
                guild.logAction(desc, "moderation", this.client.emotes.error, "error");
            });
        }

        // Autoroles
        for(let roleId of guildData.settings.welcome.autoroles){
            const role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => {});
            if(!role) continue;
            member.roles.add(role, 'Autorolle').catch(async (e) => {
                const desc =
                    " **Hinzufügen von Autorolle fehlgeschlagen**\n\n" +
                    this.client.emotes.arrow + " Rolle: " + role.name;
                guild.logAction(desc, "guild", this.client.emotes.error, "error");
            });
        }

        // Welcome message
        if(guildData.settings?.welcome.enabled){
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
                    .replaceAll(/{inviter}/g, inviter)
                    .replaceAll(/{inviter:username}/g, inviter.username)
                    .replaceAll(/{inviter:tag}/g, inviter.tag)
                    .replaceAll(/{inviter:discriminator}/g, inviter.discriminator)
                    .replaceAll(/{inviter:id}/g, inviter.id)
            }

            const welcomeMessage = parseMessage(guildData.settings.welcome.message);
            const welcomeChannel = guild.channels.cache.get(guildData.settings.welcome.channel) || await guild.channels.fetch(guildData.settings.welcome.channel).catch((e) => {
                const desc =
                    " **Senden von Willkommensnachricht fehlgeschlagen, da der Channel nicht gefunden wurde**";
                guild.logAction(desc, "guild", this.client.emotes.error, "error");
            });
            if(welcomeChannel){
                if(guildData.settings.welcome.type === "embed"){
                    const welcomeEmbed = this.client.createEmbed("{0}", null, "normal", welcomeMessage);
                    welcomeEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
                    return welcomeChannel.send({ embeds: [welcomeEmbed] }).catch((e) => {
                        const desc =
                            " **Senden von Willkommensnachricht fehlgeschlagen**";
                        guild.logAction(desc, "guild", this.client.emotes.error, "error");
                    });
                }else if(guildData.settings.welcome.type === "text"){
                    return welcomeChannel.send({ content: welcomeMessage }).catch((e) => {
                        const desc =
                            " **Senden von Willkommensnachricht fehlgeschlagen**";
                        guild.logAction(desc, "guild", this.client.emotes.error, "error");
                    });
                }
            }
        }

        // Invite system
        if(inviter) {
            const inviterData = await this.client.findOrCreateMember({id: inviter.id, guildID: guild.id});
            if(!inviterData.invites) inviterData.invites = [];
            if (inviterData.invites.find((i) => i.code === invite.code)) {
                inviterData.invites.find((i) => i.code === invite.code).uses++;
            } else {
                inviterData.invites.push({
                    code: invite.code,
                    uses: invite.uses,
                    fake: 0
                });
            }
            inviterData.markModified("invites");
            await inviterData.save();
        }
    }
}
