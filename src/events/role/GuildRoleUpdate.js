const { PermissionsBitField } = require("discord.js");
const {add} = require("mathjs");
module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(oldRole, newRole) {
        if(!oldRole || !newRole || !newRole.guild) return;
        const { guild } = newRole;

        const changes = [];
        if(oldRole.color !== newRole.color) changes.push(this.client.emotes.settings + " Farbe von **" + oldRole.hexColor + "** auf **" + newRole.hexColor + "** geändert");
        if(oldRole.name !== newRole.name) changes.push(this.client.emotes.edit + " Name von **" + oldRole.name + "** auf **" + newRole.name + "** geändert");

        const addedPermissions = [];
        const removedPermissions = [];

        const oldPermissions = oldRole.permissions.bitfield;
        const newPermissions = newRole.permissions.bitfield;

        for (const [permission, value] of Object.entries(PermissionsBitField.Flags)) {
            const hasOldPermission = (oldPermissions & value) === value;
            const hasNewPermission = (newPermissions & value) === value;

            if (hasOldPermission && !hasNewPermission) {
                if(this.client.permissions[permission]) removedPermissions.push(this.client.permissions[permission]);
            } else if (!hasOldPermission && hasNewPermission) {
                if(this.client.permissions[permission]) addedPermissions.push(this.client.permissions[permission]);
            }
        }

        let logText =
            " ** " + newRole.toString() + " wurde bearbeitet**\n\n" +
            this.client.emotes.arrow + " **Durchgeführte Änderungen:**";

        if(changes.length > 0){
            logText += "\n" + changes.join("\n");
        }

        if(addedPermissions.length > 0){
            logText += "\n" + this.client.emotes.success + " " + addedPermissions.join("\n" + this.client.emotes.success + " ");
        }

        if(removedPermissions.length > 0){
            logText += "\n" + this.client.emotes.error + " " + removedPermissions.join("\n" + this.client.emotes.error + " ");
        }

        if(changes.length === 0 && addedPermissions.length === 0 && removedPermissions.length === 0) return;

        await guild.logAction(logText, "role", this.client.emotes.events.role.update, "normal");
    }
}