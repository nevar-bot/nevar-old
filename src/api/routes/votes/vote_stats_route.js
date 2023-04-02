module.exports = function(app) {
    const vote_stats_controller = require("@api/controllers/votes/vote_stats_controller");

    app.route("/votes/:month?")
        .get(vote_stats_controller.get);
}