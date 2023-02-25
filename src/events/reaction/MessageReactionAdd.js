module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "client";
    }

    getType(){ return this.type }
    async dispatch(messageReaction, user){

        if(!user || !messageReaction || user.bot) return;


        const guildData = await this.client.findOrCreateGuild({ id: messageReaction.message.guild.id });
       
        for(let reactionRole of guildData.settings.reactionroles){
            const channelId = reactionRole.channelId;
            const messageId = reactionRole.messageId;
            const emojiId = reactionRole.emoteId;
            const roleId = reactionRole.roleId;

            let emoji = messageReaction.emoji.id ? messageReaction.emoji.id : messageReaction.emoji.name
            
            if(messageReaction.message.channel.id === channelId && messageReaction.message.id === messageId && emoji === emojiId){
                const member = await messageReaction.message.guild.members.fetch(user.id).catch(() => {});
                member.roles.add(roleId, "REACTION ROLE").catch((e) => {
                    const logText =
                        " **Fehler beim Vergeben von Rolle**\n\n" +
                       this.client.emotes.arrow + "Ich wollte eine Reactionrole vergeben, konnte dies aber nicht.";
                    return messageReaction.guild.logAction(logText, "moderation", this.client.emotes.error, "normal", messageReaction.guild.iconURL());
                });
            }
        }
    }
}
