async function get(req, res){
    const { app } = req;
    const { client } = require("@src/app");

    const contexts = [];

    for(let context of client.contextMenus.values()) {
        contexts.push({
            name: context.help.name,
            type: context.help.type,
            cooldown: context.conf.cooldown / 1000,
            member_permissions: context.conf.memberPermissions,
        });
    };

    const json = {
        status_code: 200,
        status_message: null,
        res: {
            context_count: contexts.length,
            context_list: contexts
        }
    };

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(json, null, 4));
}

module.exports = { get };