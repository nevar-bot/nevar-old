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
            if(!goodbyeChannel) return;

            if(guildData.settings.farewell.type === "embed"){
                const goodbyeEmbed = this.client.generateEmbed("{0}", null, "normal", goodbyeMessage);
                goodbyeEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
                return goodbyeChannel.send({ embeds: [goodbyeEmbed] }).catch(() => {});
            }else if(guildData.settings.welcome.type === "text"){
                return goodbyeMessage.send({ content: goodbyeMessage }).catch(() => {});
            }
        }
    }
}
