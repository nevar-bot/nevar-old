const mongoose = require("mongoose");
const { log, success, error } = require("@helpers/Logger");

module.exports = {
    async initializeMongoose(client){
        log("Connecting to MongoDB...");

        try {
            mongoose.set("strictQuery", false);
            await mongoose.connect(client.config.general["MONGO_CONNECTION"], {
                keepAlive: true
            });
            success("Mongoose connection established");
        }catch(exc){
            error("Mongoose failed to connect to database", exc);
            process.exit(1);
        }
    }
}