module.exports = function(app) {
    const command_controller = require("@api/controllers/interactions/commands_controller");
    app.route("/interactions/commands/")
        .get(command_controller.get);
}