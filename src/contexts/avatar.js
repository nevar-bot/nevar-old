const { ApplicationCommandType } = require("discord.js");
const BaseContext = require("@structures/BaseContext");

class Avatar extends BaseContext {
    constructor(client) {
        super(client, {
            name: "avatar",
            type: ApplicationCommandType.User,
            cooldown: 10 * 1000,
        })
    }

    async dispatch(interaction){
        // todo
    }
}

module.exports = Avatar;