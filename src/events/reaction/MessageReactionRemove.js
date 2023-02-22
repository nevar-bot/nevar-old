module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "client";
    }

    getType(){ return this.type }
    async dispatch(messageReaction, user){
        if(!user || !messageReaction || user.bot) return;

        const guildData = await this.client.findOrCreateGuild({id: messageReaction.message.guild.id});
        for(let reactionRole of guildData.settings.reactionroles){
            const channelId = reactionRole.channelId;
            const messageId = reactionRole.messageId;
            const emojiId = reactionRole.emoteId;
            const roleId = reactionRole.roleId;
            if(messageReaction.message.channel.id === channelId && messageReaction.message.id === messageId && messageReaction.emoji.id === emojiId){
                const member = await messageReaction.message.guild.members.fetch(user.id).catch(() => {});
                member.roles.remove(roleId, "REACTION ROLE").catch((e) => {
                    // an modlog loggen
                });
            }
        }
    }
}
