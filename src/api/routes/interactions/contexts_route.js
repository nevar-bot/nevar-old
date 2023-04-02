module.exports = function(app) {
    const contexts_controller = require("@api/controllers/interactions/contexts_controller");
    app.route("/interactions/contexts/")
        .get(contexts_controller.get);
}