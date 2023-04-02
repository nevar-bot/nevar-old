module.exports = function(app) {
    const staffs_controller = require("@api/controllers/client/staffs_controller");

    app.route("/client/staffs")
        .get(staffs_controller.get);
}