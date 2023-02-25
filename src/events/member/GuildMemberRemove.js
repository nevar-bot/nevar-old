module.exports = class {
    constructor(client){
        this.client = client;
        this.type = "client";
    }

    getType(){ return this.type }
    async dispatch(member){
        if(!member || !member.id || !member.guild) return;
        const guild = member.guild;

        const guildData = await this.client.findOrCreateGuild({
            id: guild.id
        });

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
            }
            const goodbyeMessage = parseMessage(guildData.settings.farewell.message);
            const goodbyeChannel = guild.channels.cache.get(guildData.settings.farewell.channel) || await guild.channels.fetch(guildData.settings.farewell.channel).catch(() => {});
            if(!goodbyeChannel) {
                const desc =
                    "Abschiedsnachricht konnte nicht gesendet werden\n\n" +
                    this.client.emotes.arrow + " Nutzer: " + member.user.tag + "\n" +
                    this.client.emotes.arrow + " Aktion: Der Channel konnte nicht gefunden werden";
                return guild.logAction(desc, "guild", this.client.emotes.error, "error", member.user.displayAvatarURL({ dynamic: true, size: 512 }));
            }

            if(guildData.settings.farewell.type === "embed"){
                const goodbyeEmbed = this.client.generateEmbed("{0}", null, "normal", goodbyeMessage);
                goodbyeEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
                return goodbyeChannel.send({ embeds: [goodbyeEmbed] }).catch((e) => {
                    const desc =
                        "Abschiedsnachricht konnte nicht gesendet werden\n\n" +
                        this.client.emotes.arrow + " Nutzer: " + member.user.tag + "\n" +
                        this.client.emotes.arrow + " Aktion: Embed konnte nicht gesendet werden";
                    return guild.logAction(desc, "guild", this.client.emotes.error, "error", member.user.displayAvatarURL({ dynamic: true, size: 512 }));
                });
            }else if(guildData.settings.welcome.type === "text"){
                return goodbyeChannel.send({ content: goodbyeMessage }).catch((e) => {
                    const desc =
                        "Abschiedsnachricht konnte nicht gesendet werden\n\n" +
                        this.client.emotes.arrow + " Nutzer: " + member.user.tag + "\n" +
                        this.client.emotes.arrow + " Aktion: Textnachricht konnte nicht gesendet werden";
                    return guild.logAction(desc, "guild", this.client.emotes.error, "error", member.user.displayAvatarURL({ dynamic: true, size: 512 }));
                });
            }
        }

        // Log to member log
        const logText =
            " **Mitglied verloren**\n\n" +
            this.client.emotes.arrow + "Mitglied: " + member.user.tag + "\n" +
            this.client.emotes.arrow + "Aktion: Hat den Server verlassen";

        return guild.logAction(logText, "guild", this.client.emotes.events.guild.update, "error", member.user.displayAvatarURL({ dynamic: true }));
    }
}
