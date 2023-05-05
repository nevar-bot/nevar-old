const mongoose = require("mongoose");
const { log, success, error } = require("@helpers/Logger");

module.exports = {
    async initializeMongoose(client){
        log("Establishing mongoose connection...");

        try {
            mongoose.set("strictQuery", false);
            await mongoose.connect(client.config.general["MONGO_CONNECTION"], {
                keepAlive: true
            });
            success("Mongoose connection established");
        }catch(exc){
            error("Failed establishing mongoose connection", exc);
            process.exit(1);
        }
    }
}