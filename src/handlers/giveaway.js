const { GiveawaysManager } = require("discord-giveaways");
const Model = require("@schemas/Giveaway");

class MongooseGiveaways extends GiveawaysManager {

    constructor(client) {
        super(client, {
            default: {
                botsCanWin: false,
                embedColor: client.config.embeds["DEFAULT_COLOR"],
                embedColorEnd: client.config.embeds["WARNING_COLOR"],
                buttons: {
                    join: client.createButton("join", null, "Primary", client.emotes.tada, false, null),
                    joinReply: client.emotes.join + " Du hast am Giveaway teilgenommen",
                    leaveReply: client.emotes.leave + " Du nimmst nicht mehr am Giveaway teil",
                }
            }
        }, false);
    }

    async getAllGiveaways() {
        return await Model.find().lean().exec();
    }

    async saveGiveaway(messageId, giveawayData){
        await Model.create(giveawayData);
        return true;
    }

    async editGiveaway(messageId, giveawayData){
        await Model.updateOne({ messageId }, giveawayData, { omitUndefined: true}).exec();
        return true;
    }

    async deleteGiveaway(messageId){
        await Model.deleteOne({ messageId }).exec();
        return true;
    }
}

module.exports = (client) => new MongooseGiveaways(client);