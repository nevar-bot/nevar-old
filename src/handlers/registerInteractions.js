const { PermissionsBitField, REST, Routes, ContextMenuCommandBuilder} = require('discord.js');

module.exports = {
    async init(client) {
        client.logger.log("Start registering interactions...");
        const rest = new REST({version: '10'}).setToken(client.token);
        let interactions = [];

        // SLASH COMMANDS
        for(let command of client.commands) {
            let clientCommand = command[1];
            if (!clientCommand || !clientCommand?.slashCommand || !clientCommand.slashCommand.addCommand) continue;
            let slashData = clientCommand.slashCommand.data;
            if (!slashData) continue;

            await slashData.setName(clientCommand.help.name);
            await slashData.setDescription(clientCommand.help.description);

            if (clientCommand.conf.memberPermissions.length >= 1){
                const PermissionsField = new PermissionsBitField();
                for(let neededPermission of clientCommand.conf.memberPermissions){
                    PermissionsField.add(PermissionsBitField.Flags[neededPermission]);
                }
                await slashData.setDefaultMemberPermissions(PermissionsField.bitfield);
            }

            interactions.push(slashData.toJSON());
        }
        // CONTEXT MENUS
        for(let context of client.contextMenus){
            context = context[1];

            const contextData = new ContextMenuCommandBuilder()
                .setName(context.help.name)
                .setType(context.help.type);

            if(context.conf.memberPermissions.length >= 1){
                const PermissionsField = new PermissionsBitField();
                for(let neededPermission of context.conf.memberPermissions){
                    PermissionsField.add(PermissionsBitField.Flags[neededPermission]);
                }
                await contextData.setDefaultMemberPermissions(PermissionsField.bitfield);
            }
            interactions.push(contextData.toJSON());
        }

        let res = {
            state: false,
            interactionCount: 0,
            callback: undefined
        }

        await rest.put(Routes.applicationCommands(client.user.id), { body: interactions })
            .then(() => {
                client.logger.success('Registered ' + interactions.length + ' interactions');
                res.state = true;
                res.interactionCount = interactions.length;
            })
            .catch((exception) => {
                client.logger.error('Error registering interactions: ' + exception);
                console.log(exception);
                res.callback = exception;
                client.logException(exception, null, null, "await <Rest>.put(<Routes.applicationCommands>)");
            });
        return res;
    }
}
