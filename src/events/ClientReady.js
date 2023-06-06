const fs = require('fs');
const schedule = require('node-schedule');
const moment = require("moment");
const presenceHandler = require("@handlers/presence");
const levels = require("discord-xp");
const { Collection } = require("discord.js");

module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async dispatch() {
        const client = this.client;
        const config = client.config;

        // Initialize levels
        levels.setURL(config.general["MONGO_CONNECTION"]);

        // Initialize giveaways manager
        client.logger.log("Initializing giveaways manager...");
        await client.giveawayManager._init().then((_) => client.logger.success("Initialized giveaways manager"));

        //Update interactions every day at 00:00
        schedule.scheduleJob('0 0 * * *', async () => {
            await require('@handlers/registerInteractions').init(client);
        });

        // Update bot presence
        presenceHandler(client);

        require('@helpers/DBL').init(client);
        require('@handlers/unbanMembers').init(client);
        require('@handlers/unmuteMembers').init(client);
        require('@handlers/remindMembers').init(client);
        if(config.api["ENABLED"]) await require('@api/app').initializeApi(client);

        // Support server stats channels
        if (config.support["ID"]) {
            setInterval(async function () {
                let supportGuild = client.guilds.cache.get(config.support["ID"]);
                let serverChannel, voteChannel, userChannel;
                if (config.channels["SERVER_COUNT_ID"]) serverChannel = supportGuild.channels.cache.get(config.channels["SERVER_COUNT_ID"]);
                if (config.channels["VOTE_COUNT_ID"]) voteChannel = supportGuild.channels.cache.get(config.channels["VOTE_COUNT_ID"]);
                if (config.channels["USER_COUNT_ID"]) userChannel = supportGuild.channels.cache.get(config.channels["USER_COUNT_ID"]);

                if (serverChannel) serverChannel.setName(config.channels["SERVER_COUNT_NAME"].replace('{count}', client.guilds.cache.size));
                if (userChannel) userChannel.setName(config.channels["USER_COUNT_NAME"].replace('{count}', client.format(client.guilds.cache.reduce((sum, guild) => sum + (guild.available ? guild.memberCount : 0), 0))));

                let votes = JSON.parse(fs.readFileSync('./assets/votes.json'));

                const date = new Date();
                let month = date.toLocaleString('de-DE', {month: "long"});
                month = month.charAt(0).toUpperCase() + month.slice(1);

                let months = moment.months();
                let voteMonth = months[(new Date(Date.now()).getMonth())];
                if (voteChannel) voteChannel.setName(config.channels["VOTE_COUNT_NAME"]
                    .replace('{count}', client.format(votes[voteMonth.toLowerCase()] || 0))
                    .replace('{month}', month))
            }, 120 * 1000)
        }

        // Cache invites
        client.guilds.cache.forEach((guild) => {
            guild.invites.fetch()
                .then((invites) => {
                    client.invites.set(guild.id, new Collection(invites.map((invite) => [invite.code, invite.uses])));
                })
                .catch(() => {});
        });

        client.logger.log("Loaded " + client.guilds.cache.size + " guilds", "info")
        client.logger.success("Logged in as " + client.user.tag);

        // ONLY FOR DEVELOPMENT PURPOSES
        // REGISTER INTERACTIONS, IF DEVELOPMENT MODE IS ENABLED
        if(process.argv.slice(2)[0] === "--dev"){
            await require('@handlers/registerInteractions').init(client);
        }
    }
};
