module.exports = function(app) {
    const member_level_controller = require("@api/controllers/levels/member_controller");

    app.route("/levels/member/:guildID/:memberID")
        .get(member_level_controller.get);
}