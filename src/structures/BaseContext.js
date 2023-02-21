module.exports = class BaseContext {
    constructor(client, {
        name = null,
        type = null,
        memberPermissions = [],
        cooldown = 0
    })
    {
        this.client = client;
        this.conf = { memberPermissions, cooldown };
        this.help = { name, type };
    }
}