module.exports = function(app) {
    const guildController = require("../../controllers/levels/guildController");

    app.route("/levels/guild/:guildID/:amount?")
        .get(guildController.getLeaderBoard);
}