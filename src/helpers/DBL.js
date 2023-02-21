const { createDjsClient } = require("discordbotlist");

module.exports = {
    init(client) {
        if (client.config.apikeys["DBL"] && client.config.apikeys["DBL"] !== "" && client.config.channels["VOTE_ANNOUNCEMENT_ID"] && client.config.channels["VOTE_ANNOUNCEMENT_ID"] !== "") {
            //Post bot stats to discordbotlist.com every 10 minutes
            const dbl = createDjsClient(client.config.apikeys["DBL"], client);
            dbl.startPosting(10 * 60 * 1000)
        }
    }
};
