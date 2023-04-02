module.exports = function(app) {
    const guild_levels_controller = require("@api/controllers/levels/guild_controller");
    app.route("/levels/leaderboard/:guildID/:amount?")
        .get(guild_levels_controller.get);
}