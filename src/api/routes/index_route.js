module.exports = function(app) {
    const index_controller = require("@api/controllers/index_controller");
    app.route("/")
        .get(index_controller.get);
}