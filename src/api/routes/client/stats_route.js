module.exports = function(app) {
    const stats_controller = require("@api/controllers/client/stats_controller");

    app.route("/client/stats")
        .get(stats_controller.get);
}