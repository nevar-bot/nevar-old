module.exports = function(app) {
    const incomingVoteController = require("../../controllers/votes/incomingVoteController");

    app.route("/votes/post")
        .post(incomingVoteController.handleVote);
}