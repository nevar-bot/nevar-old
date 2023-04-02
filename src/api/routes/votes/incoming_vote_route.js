module.exports = function(app) {
    const incoming_vote_controller = require("@api/controllers/votes/incoming_vote_controller");

    app.route("/votes/post")
        .post(incoming_vote_controller.post);
}