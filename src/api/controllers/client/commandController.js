exports.getCommands = async function(req, res) {
    const { client } = require("@src/app");

    const commands = [];

    for(let command of client.commands){
        command = command[1];
        let cmd = {
            name: command.help.name,
            description: command.help.description,
            cooldown: command.conf.cooldown / 1000,
            needed_permissions: command.conf.memberPermissions,
            needed_permissions_bot: command.conf.botPermissions,
            nsfw: command.conf.nsfw,
            staff_only: command.conf.staffOnly,
            owner_only: command.conf.ownerOnly
        }
        commands.push(cmd);
    }

    let json = {
        command_count: client.commands.size,
        command_list: commands
    }

    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(json, null, 4));


}