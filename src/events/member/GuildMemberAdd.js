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
                // an mod log loggen
            });
        }

        // Autoroles
        for(let roleId of guildData.settings.welcome.autoroles){
            const role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => {});
            if(!role) continue;
            member.roles.add(role, 'Autorolle').catch(async (e) => {
                // an mod log loggen
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
            const welcomeChannel = guild.channels.cache.get(guildData.settings.welcome.channel) || await guild.channels.fetch(guildData.settings.welcome.channel).catch(() => {});
            if(!welcomeChannel) return;

            if(guildData.settings.welcome.type === "embed"){
                const welcomeEmbed = this.client.generateEmbed("{0}", null, "normal", welcomeMessage);
                welcomeEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
                return welcomeChannel.send({ embeds: [welcomeEmbed] }).catch(() => {});
            }else if(guildData.settings.welcome.type === "text"){
                return welcomeChannel.send({ content: welcomeMessage }).catch(() => {});
            }
        }
    }
}
