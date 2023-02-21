module.exports = function(app) {
    const memberController = require("../../controllers/levels/memberController");

    app.route("/levels/member/:guildID/:memberID")
        .get(memberController.getMember);
}