const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");

async function initializeApi(client) {
    const app = express();

    app.use(helmet());
    app.use(bodyParser.json());
    app.use(cors());

    fs.readdirSync("./src/api/routes").forEach((file) => {
        if(!file.endsWith(".js")){
            fs.readdirSync("./src/api/routes/" + file).forEach((nestedFile) => {
                if(nestedFile.endsWith(".js")) require("@api/routes/" + file + "/" + nestedFile)(app);
            });
        }else{
            require("@api/routes/" + file)(app);
        }
    });

    app.listen(client.config.api["PORT"], () => {
        client.logger.log("API is running on port " + client.config.api["PORT"], "info");
    });
}

module.exports = { initializeApi };