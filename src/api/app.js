const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

async function initializeApi(client) {
    const app = express();

    app.use(helmet());
    app.use(bodyParser.json());
    app.use(cors());

    require("./routes/levels/guildRoute")(app);
    require("./routes/levels/memberRoute")(app);
    require("./routes/votes/incomingVoteRoute")(app);
    require("./routes/votes/voteStatsRoute")(app);
    require("./routes/client/statsRoute")(app);
    require("./routes/client/commandRoute")(app);
    require("./routes/client/staffRoute")(app);

    app.listen(client.config.api["PORT"], () => {
        client.logger.log("Started API on port " + client.config.api["PORT"], "info");
    });

    app.get("/", async (req, res) => {
        let json = {
            status: 200,
            message: null,
            routes: []
        }
        app._router.stack.forEach(function(r){
            if(!r || !r.route) return;
            if(r.route.path === "*" || r.route.path === "/") return;

            let type = r.route.methods.get ? "GET" : "POST";
            json.routes.push(type + " " + req.get("host") + r.route.path);
        });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(json, null, 4));
    });

    app.get("*", async (req, res) => {
        let json = {
            status: 404,
            message: "Requested route not found",
            routes: []
        }
        app._router.stack.forEach(function(r){
            if(!r || !r.route) return;
            if(r.route.path === "*" || r.route.path === "/") return;

            let type = r.route.methods.get ? "GET" : "POST";
            json.routes.push(type + " " + req.get("host") + r.route.path);
        });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(json, null, 4));
    });
}

module.exports = { initializeApi };