async function get(req, res) {
    const {app} = req;

    const json = {
        status_code: 200,
        status_message: null,
        routes: []
    };

    app._router.stack.forEach(function (r) {
        if (!r || !r.route) return;
        if (r.route.path === "*" || r.route.path === "/") return;

        const type = r.route.methods.get ? "GET" : "POST"
        json.routes.push(type + " " + req.get("host") + r.route.path);
    });

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(json, null, 4));
}

module.exports = { get };