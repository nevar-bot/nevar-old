const fs = require("fs");
const toml = require("toml");
const { log, warn, error } = require("@helpers/Logger");
const { isBoolean } = require("util");
module.exports = class Validator {
    static configValidator(){
        const config = toml.parse(fs.readFileSync("./config.toml", "utf-8"));
        log("TOML: Validating config file...");

        // TOKEN CHECK
        if(!config.general["BOT_TOKEN"]){
            error("TOML: general.BOT_TOKEN cannot be empty");
            return process.exit(1);
        }

        // MONGODB CONNECTION
        if(!config.general["MONGO_CONNECTION"]){
            error("TOML: general.MONGO_CONNECTION cannot be empty");
            return process.exit(1);
        }

        // WEBSITE
        if(!config.general["WEBSITE"]){
            error("TOML: general.WEBSITE cannot be empty");
            return process.exit(1);
        }

        // BOT LOG
        if(!config.support["BOT_LOG"]){
            error("TOML: support.BOT_LOG cannot be empty");
            return process.exit(1);
        }

        // ERROR LOG
        if(!config.support["ERROR_LOG"]){
            error("TOML: support.ERROR_LOG cannot be empty");
            return process.exit(1);
        }

        // API
        if(!isBoolean(config.api["ENABLED"])){
            error("TOML: api.ENABLED must be either true or false");
            return process.exit(1);
        }

        // API PORT IF API IS ENABLED
        if(config.api["ENABLED"] && isNaN(config.api["PORT"])){
            error("TOML: api.PORT has to be an integer when api.ENABLED is true");
            return process.exit(1);
        }

        // WARNINGS
        if(config.general["OWNER_IDS"].length === 0) warn("TOML: general.OWNER_IDS is empty");
        if(!config.support["ID"]) warn("TOML: support.ID is empty");
        if(!config.support["INVITE"]) warn("TOML: support.INVITE is empty");
        if(!config.embeds["DEFAULT_COLOR"]) warn("TOML: embeds.DEFAULT_COLOR is empty");
        if(!config.embeds["SUCCESS_COLOR"]) warn("TOML: embeds.SUCCESS_COLOR is empty");
        if(!config.embeds["WARNING_COLOR"]) warn("TOML: embeds.WARNING_COLOR is empty");
        if(!config.embeds["WARNING_COLOR"]) warn("TOML: embeds.WARNING_COLOR is empty");
        if(!config.embeds["ERROR_COLOR"]) warn("TOML: embeds.ERROR_COLOR is empty");
        if(!config.channels["SERVER_COUNT_ID"]) warn("TOML: channels.SERVER_COUNT_ID is empty");
        if(!config.channels["USER_COUNT_ID"]) warn("TOML: channels.USER_COUNT_ID is empty");
        if(!config.channels["VOTE_COUNT_ID"]) warn("TOML: channels.VOTE_COUNT_ID is empty");
        if(!config.channels["VOTE_ANNOUNCEMENT_ID"]) warn("TOML: channels.VOTE_ANNOUNCEMENT_ID is empty");
        if(!config.apikeys["AMARI_BOT"]) warn("TOML: apikeys.AMARI_BOT is empty. Amari level as a giveaway requirement won't work");
        if(!config.apikeys["DBL"]) warn("TOML: apikeys.DBL is empty. Posting stats to discordbotlist.com and receiving votes won't work");
        if(!config.apikeys["DBL_WEBHOOK_AUTH"]) warn("TOML: apikeys.DBL_WEBHOOK_AUTH is empty. Receiving votes from discordbotlist.com won't work");
        if(!config.apikeys["WEATHER"]) warn("TOML: apikeys.WEATHER is empty. Weather command won't work");
    }
}