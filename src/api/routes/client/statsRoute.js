module.exports = function(app) {
    const statsController = require("../../controllers/client/statsController");

    app.route("/client/info/stats")
        .get(statsController.getStats);
}