module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "client";
    }

    getType(){ return this.type }
    async dispatch(messageReaction, user){
        if(!user || !messageReaction || user.bot) return;

        const guildData = await this.client.findOrCreateGuild({ id: messageReaction.message.guild.id });
        for(let value of guildData.settings.reactionroles){
            const msgId = value.split('|')[0];
            const emote = value.split('|')[1];
            const roleId = value.split('|')[2];
            if(messageReaction.message.id === msgId){
                if(messageReaction.emoji.id && messageReaction.emoji.id === emote){
                    const member = await messageReaction.message.guild.members.fetch(user.id);
                    member.roles.add(roleId, "REACTION ROLE").catch((e) => {
                        // an modlog loggen
                    });
                }
            }
        }
    }
}
