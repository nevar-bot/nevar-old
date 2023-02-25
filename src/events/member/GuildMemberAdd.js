module.exports = class {
    constructor(client){
        this.client = client;
        this.type = "client";
    }

    getType() {
        return this.type;
    }

    async dispatch(member){
        if(!member || !member.id || !member.guild) return;
        const guild = member.guild;

        const guildData = await this.client.findOrCreateGuild({
            id: guild.id
        });

        const memberData = await this.client.findOrCreateMember({
            id: member.user.id,
            guildID: guild.id
        });

        // User is muted
        if(memberData.muted?.state){
            member.roles.add(guildData.settings.muterole).catch(async (e) => {
                const desc =
                    "Automatischer Mute fehlgeschlagen\n\n" +
                    this.client.emotes.arrow + " Nutzer: " + member.user.tag + "\n" +
                    this.client.emotes.arrow + " Aktion: Mitglied welches gemutet ist, ist dem Server beigetreten";
                guild.logAction(desc, "moderation", this.client.emotes.error, "error", member.user.displayAvatarURL({dynamic: true}));
            });
        }

        // Autoroles
        for(let roleId of guildData.settings.welcome.autoroles){
            const role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => {});
            if(!role) continue;
            member.roles.add(role, 'Autorolle').catch(async (e) => {
                const desc =
                    "Hinzufügen von Autorolle fehlgeschlagen\n\n" +
                    this.client.emotes.arrow + " Nutzer: " + member.user.tag + "\n" +
                    this.client.emotes.arrow + " Rolle: " + role.name + "\n";
                guild.logAction(desc, "guild", this.client.emotes.error, "error", member.user.displayAvatarURL({dynamic: true}));
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
            }

            const welcomeMessage = parseMessage(guildData.settings.welcome.message);
            const welcomeChannel = guild.channels.cache.get(guildData.settings.welcome.channel) || await guild.channels.fetch(guildData.settings.welcome.channel).catch((e) => {
                const desc =
                    "Willkommensnachricht senden fehlgeschlagen\n\n" +
                    this.client.emotes.arrow + " Nutzer: " + member.user.tag + "\n" +
                    this.client.emotes.arrow + " Aktion: Willkommensnachricht konnte nicht gesendet werden, da der Channel nicht gefunden wurde";
                guild.logAction(desc, "guild", this.client.emotes.error, "error", member.user.displayAvatarURL({dynamic: true}));

            });
            if(!welcomeChannel) return;

            if(guildData.settings.welcome.type === "embed"){
                const welcomeEmbed = this.client.generateEmbed("{0}", null, "normal", welcomeMessage);
                welcomeEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
                return welcomeChannel.send({ embeds: [welcomeEmbed] }).catch((e) => {
                    const desc =
                        "Willkommensnachricht senden fehlgeschlagen\n\n" +
                        this.client.emotes.arrow + " Nutzer: " + member.user.tag + "\n" +
                        this.client.emotes.arrow + " Aktion: Embed konnte nicht gesendet werden";
                    guild.logAction(desc, "guild", this.client.emotes.error, "error", member.user.displayAvatarURL({dynamic: true}));
                });
            }else if(guildData.settings.welcome.type === "text"){
                return welcomeChannel.send({ content: welcomeMessage }).catch((e) => {
                    const desc =
                        "Willkommensnachricht senden fehlgeschlagen\n\n" +
                        this.client.emotes.arrow + " Nutzer: " + member.user.tag + "\n" +
                        this.client.emotes.arrow + " Aktion: Textnachricht konnte nicht gesendet werden";
                    guild.logAction(desc, "guild", this.client.emotes.error, "error", member.user.displayAvatarURL({dynamic: true}));
                });
            }
        }

        // Log to member log
        const logText =
            " **Neues Mitglied**\n\n" +
            this.client.emotes.arrow + "Mitglied: " + member.user.tag + "\n" +
            this.client.emotes.arrow + "Aktion: Hat den Server betreten";

        return guild.logAction(logText, "guild", this.client.emotes.events.guild.update, "success", member.user.displayAvatarURL({ dynamic: true }));
    }
}
