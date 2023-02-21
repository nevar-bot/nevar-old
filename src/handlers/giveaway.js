const { GiveawaysManager } = require("discord-giveaways");
const Model = require("@schemas/Giveaway");

class MongooseGiveaways extends GiveawaysManager {

    constructor(client) {
        super(client, {
            default: {
                botsCanWin: false,
                embedColor: client.config.embeds.default_color,
                embedColorEnd: client.config.embeds.error_color,
                reaction: "🎉"
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