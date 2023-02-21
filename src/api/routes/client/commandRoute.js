module.exports = function(app) {
    const commandController = require("../../controllers/client/commandController");

    app.route("/client/commands/:language?")
        .get(commandController.getCommands);
}