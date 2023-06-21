const moment = require("moment/moment");
const { Collection, EmbedBuilder} = require("discord.js");

module.exports = class {
    constructor(client){
        this.client = client;
    }

    async dispatch(member){
        if(!member || !member.id || !member.guild || member.pending) return;

        const { guild } = member;
        if(!guild.available) return;

        // Guild and member data
        const guildData = await this.client.findOrCreateGuild({ id: guild.id });
        const memberData = await this.client.findOrCreateMember({ id: member.user.id, guildID: guild.id });

        // Invite data
        const [ fetchedInvites, cachedInvites ] = await Promise.all([
            guild.invites.fetch().catch(() => {}),
            this.client.invites.get(guild.id)
        ]);

        const inviteData = {
            inviter: undefined,
            invite: undefined,
            totalInvites: 0
        };

        // Get used invite and inviter
        if(fetchedInvites && cachedInvites){
            inviteData.invite = fetchedInvites.find(i => i.uses > cachedInvites.get(i.code));
            inviteData.inviter = await this.client.users.fetch(inviteData.invite?.inviterId).catch(() => {});
            inviteData.totalInvites = [...fetchedInvites.values()]
                .filter(invite => invite?.inviterId === inviteData.inviter?.id)
                .reduce((total, invite) => total + invite.uses, inviteData.totalInvites || 0);

            this.client.invites.set(guild.id, new Collection(fetchedInvites.map((invite) => [invite.code, invite.uses])));
        }

        // Send log
        const createdAt = moment(member.user.createdTimestamp).format("DD.MM.YYYY HH:mm");
        const createdDiff = this.client.utils.getRelativeTime(member.user.createdTimestamp);

        const logText =
            " **" + member.user.tag + " hat den Server betreten**\n\n" +
            this.client.emotes.calendar + " Account erstellt am: **" + createdAt + "**\n" +
            this.client.emotes.reminder + " Account erstellt vor: **" + createdDiff + "**\n" +
            (inviteData.inviter ? this.client.emotes.invite + " Eingeladen von: **" + inviteData.inviter.tag + "**" : "");

        await guild.logAction(logText, "guild", this.client.emotes.events.member.unban, "success", member.user.displayAvatarURL({ dynamic: true }));

        // Member is muted, add mute role
        if(memberData.muted?.state){
            member.roles.add(guildData.settings.muterole).catch(async (e) => {
                const desc =
                    "**Automatischer Mute von " + member.user.tag + " fehlgeschlagen**\n\n" +
                    this.client.emotes.arrow + " Mitglied welches gemuted war konnte nach Rejoin die Mute-Rolle nicht automatisch zugewiesen werden";
                guild.logAction(desc, "moderation", this.client.emotes.error, "error");
            });
        }

        // Add autoroles
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

        // Send welcome message
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
                    .replaceAll(/{inviter}/g, inviteData.inviter || "Unbekannt")
                    .replaceAll(/{inviter:username}/g, inviteData.inviter?.username || "Unbekannt")
                    .replaceAll(/{inviter:tag}/g, inviteData.inviter?.tag || "Unbekannt#0000")
                    .replaceAll(/{inviter:discriminator}/g, inviteData.inviter?.discriminator || "0000")
                    .replaceAll(/{inviter:id}/g, inviteData.inviter?.id || "000000000000000000")
                    .replaceAll(/{inviter:invites}/g, inviteData.totalInvites || 0)
                    .replaceAll(/{newline}/g, "\n");
            }

            const welcomeMessage = parseMessage(guildData.settings.welcome.message);
            const welcomeChannel = guild.channels.cache.get(guildData.settings.welcome.channel) || await guild.channels.fetch(guildData.settings.welcome.channel).catch((e) => {
                const desc = " **Senden von Willkommensnachricht fehlgeschlagen, da der Channel nicht gefunden wurde**";
                guild.logAction(desc, "guild", this.client.emotes.error, "error");
            });
            if(welcomeChannel){
                if(guildData.settings.welcome.type === "embed"){
                    const welcomeEmbed = new EmbedBuilder()
                        .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL()})
                        .setDescription(welcomeMessage)
                        .setColor(guildData.settings.welcome.color)
                        .setFooter({ text: this.client.config.embeds["FOOTER_TEXT"] });

                    if (guildData.settings.welcome.profilePicture) {
                        welcomeEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
                    }

                    welcomeChannel.send({ embeds: [welcomeEmbed] }).catch((e) => {
                        const desc =
                            " **Senden von Willkommensnachricht fehlgeschlagen**";
                        guild.logAction(desc, "guild", this.client.emotes.error, "error");
                    });
                }else if(guildData.settings.welcome.type === "text"){
                    welcomeChannel.send({ content: welcomeMessage }).catch((e) => {
                        const desc =
                            " **Senden von Willkommensnachricht fehlgeschlagen**";
                        guild.logAction(desc, "guild", this.client.emotes.error, "error");
                    });
                }
            }
        }

        // Track invite stats
        if(inviteData.inviter && inviteData.invite) {
            const inviterData = await this.client.findOrCreateMember({id: inviteData.inviter.id, guildID: guild.id});
            if(!inviterData.invites) inviterData.invites = [];
            if (inviterData.invites.find((i) => i.code === inviteData.invite.code)) {
                inviterData.invites.find((i) => i.code === inviteData.invite.code).uses++;
            } else {
                inviterData.invites.push({
                    code: inviteData.invite.code,
                    uses: inviteData.invite.uses,
                    fake: 0,
                    left: 0
                });
            }
            if(inviteData.inviter.id === member.user.id) inviterData.invites.find((i) => i.code === inviteData.invite.code).fake++;
            if(memberData.inviteUsed === inviteData.invite.code) inviterData.invites.find((i) => i.code === inviteData.invite.code).fake++;
            if(memberData.inviteUsed === inviteData.invite.code) inviterData.invites.find((i) => i.code === inviteData.invite.code).left--;
            memberData.inviteUsed = inviteData.invite.code;

            memberData.markModified("inviteUsed")
            await memberData.save();

            inviterData.markModified("invites");
            await inviterData.save();
        }
    }
}
