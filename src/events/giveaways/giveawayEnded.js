module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "giveaway";
    }

    getType(){
        return this.type;
    }

    async dispatch(giveaway, winners) {
        if(giveaway.ended === true  && winners.length > 0){
            let guild = giveaway.message.guild;
            let embed = this.client.giveawaysManager.generateEndEmbed(giveaway, winners);
            embed.setDescription(guild.translate("misc/giveaway:main:gwMessages:winners")
                .replaceAll('{emotes.info}', this.client.emotes.star)
                .replace('{emotes.support}', this.client.emotes.badges.earlysupporter)
                .replace('{client}', this.client.user.username)
                .replace('{invite}', this.client.invite)
                .replace('{winners}', winners.join(', '))
                .replace('{this.winnerCount}', giveaway.winnerCount)
                .replace('{this.hostedBy}', giveaway.hostedBy)
                .replace('{timestamp1}', '<t:' + Math.round(giveaway.endAt / 1000) + ':R>')
                .replace('{timestamp2}', '<t:' + Math.round(giveaway.endAt / 1000) + ':f>')
                .replace('{condition}', giveaway.extraData.requirement.text))
            embed.setFooter({text: guild.translate("misc/giveaway:main:gwMessages:endedAt")});
            embed.setColor('09ff00');
            await giveaway.message.edit({embeds:[embed]}).catch(() => {});
        }

    }
};
