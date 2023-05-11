require("module-alias/register");
require("@helpers/extenders/Guild");

const BaseClient = require("@structures/BaseClient");
const { initializeMongoose } = require("@database/mongoose");
const { configValidator } = require("@helpers/Validator");
const Loader = require("@helpers/Loader");
configValidator();

// Initialize client
const client = new BaseClient();

process.on("unhandledRejection", (e) => {
    console.error(e);
    return client.alertException(e);
});

(async () => {
    await initializeMongoose(client);
    await Loader.loadCommands(client);
    await Loader.loadEvents(client);
    await Loader.loadContexts(client);
    await client.login(client.config.general["BOT_TOKEN"])
})();

module.exports.client = client;

