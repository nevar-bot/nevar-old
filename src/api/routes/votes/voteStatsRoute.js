module.exports = function(app) {
    const voteStatsController = require("../../controllers/votes/voteStatsController");

    app.route("/votes/stats/:month?")
        .get(voteStatsController.getVoteStats);
}