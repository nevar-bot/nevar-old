const path = require('path');

module.exports = class BaseCommand {
    constructor(client, {
        name = null,
        description = null,
        dirname = false,
        botPermissions = [],
        memberPermissions = [],
        nsfw = false,
        ownerOnly = false,
        staffOnly = false,
        cooldown = 0,
        slashCommand = {
            addCommand: true,
            options: []
        }
    })
    {
        const category = (dirname ? dirname.split(path.sep)[parseInt(String(dirname.split(path.sep).length - 1), 10)] : "Other");
        this.client = client;
        this.conf = { memberPermissions, botPermissions, nsfw, ownerOnly, staffOnly, cooldown };
        this.help = { name, category, description };
        this.slashCommand = slashCommand;
    }
};
