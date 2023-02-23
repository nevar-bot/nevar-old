const fs = require("fs");
const readdir = require('util').promisify(fs.readdir);
const { recursiveReadDirSync } = require("@helpers/Utils");
const path = require("path");
const { ApplicationCommandType, Events } = require("discord.js");

module.exports = class Loader {
    static async loadCommands(client){
        let success = 0;
        let failed = 0;
        client.logger.log("Loading commands...");
        const directories = await readdir("./src/commands/");
        for(let directory of directories) {
            const commands = await readdir('./src/commands/' + directory + '/');
            commands.forEach((cmd) => {
                if(cmd.split('.')[1] === 'js') {
                    let response = client.loadCommand('../commands/' + directory, cmd);
                    if(response) {
                        failed++;
                        client.logger.error("Couldn't load command " + cmd + ": " + response);
                    }else{
                        success++;
                    }
                }
            });
        }
        client.logger.log("Loaded " + (success + failed) + " commands. Success (" + success + ") Failed (" + failed + ")");
    }

    static loadEvents(client) {
        client.logger.log(`Loading events...`);
        const directory = "src/events";
        let success = 0;
        let failed = 0;

        recursiveReadDirSync(directory).forEach((filePath) => {
            const file = path.basename(filePath);
            try {
                const eventName = path.basename(file, ".js");
                const event = new(require(filePath))(client);
                const type = event.getType();
                // Discord events
                if(type === "client"){
                    client.on(Events[eventName], (...args) => event.dispatch(...args));
                    success++;
                }
                // Giveaway manager events
                if(type === "giveaway"){
                    client.giveawayManager.on(eventName, (...args) => event.dispatch(...args));
                    success++;
                }
                if(type === "log"){
                    client.on(eventName, (...args) => event.dispatch(...args));
                    success++;
                }
                delete require.cache[require.resolve(filePath)];
            } catch (ex) {
                failed++;
                client.logger.error("Couldn't load event " + file + ": " + ex);
            }
        });

        client.logger.log("Loaded " + (success + failed) + " events. Success (" + success + ") Failed (" + failed + ")");
    }
    static async loadContexts(client){
        let success = 0;
        let failed = 0;
        let userContexts = 0;
        let messageContexts = 0;
        client.logger.log("Loading context menus...");
        const directory = await readdir("./src/contexts/");
        for(let file of directory) {
            if(file.split('.')[1] === 'js') {
                try {
                    const props = new (require("@contexts/" + file))(client);
                    if(props.init){
                        props.init(client);
                    }
                    client.contextMenus.set(props.help.name, props);
                    if(props.help.type === ApplicationCommandType.User) userContexts++;
                    if(props.help.type === ApplicationCommandType.Message) messageContexts++;
                    success++;
                }catch(exc){
                    failed++;
                    client.logger.error("Failed to load context menu " + file + ": " + exc);
                }
            }
        }
        client.logger.log("Loaded " + (success + failed) + " context menus (" + userContexts + " user, " + messageContexts + " message). Success (" + success + ") Failed (" + failed + ")");
    }
}