const { PermissionsBitField } = require("discord.js");
const interactionCooldowns = {};
const fs = require("fs");

module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "client";
    }
    getType(){ return this.type }

    async dispatch(interaction) {
        if(!interaction || !interaction.type || !interaction.member || !interaction.guildId) return;

        // ------------------------
        // --- BASIC INFORMATION --
        // ------------------------
        const guild = this.client.guilds.cache.get(interaction.guildId);
        const member = interaction.member;
        const channel = guild.channels.cache.get(interaction.channelId);

        const data = {
            guild: await this.client.findOrCreateGuild({ id: interaction.guildId }),
            member: await this.client.findOrCreateMember({ id: interaction.member.user.id, guildID: interaction.guildId }),
            user: await this.client.findOrCreateUser({ id: interaction.member.user.id })
        };

        // ---------------------------
        // --- HANDLE CONTEXT MENUS --
        // ---------------------------
        if(interaction.isContextMenuCommand()){
            await interaction.deferReply();
            const context = this.client.contextMenus.get(interaction.commandName);

            // USER IS BLOCKED
            if(data.user.blocked.state){
                const reason = data.user.blocked.reason || "Kein Grund angegeben";
                const blockedEmbed = this.client.generateEmbed("Du wurdest von {0} blockiert und kannst keine Befehle mehr nutzen.\n{1} Grund: {2}", "error", "error", this.client.user.username, this.client.emotes.arrow, reason);
                return interaction.editReply({ embeds: [blockedEmbed] });
            }

            // GUILD IS BLOCKED
            if(data.guild.blocked.state){
                const reason = data.guild.blocked.reason || "Kein Grund angegeben";
                const blockedEmbed = this.client.generateEmbed("Da dieser Server von {0} blockiert wurde, können Befehle hier nicht mehr genutzt werden.\n{1} Grund: {2}", "error", "error", this.client.user.username, this.client.emotes.arrow, reason);
                return interaction.editReply({ embeds: [blockedEmbed] });
            }

            // USER IS IN COOLDOWN
            let userCooldown = interactionCooldowns[member.user.id];
            if(!userCooldown){
                interactionCooldowns[member.user.id] = {};
                userCooldown = interactionCooldowns[member.user.id];
            }
            const time = userCooldown[context.help.name] || 0;
            if(time > Date.now()){
                // STAFFS DONT HAVE COOLDOWNS
                if(!data.user.staff.state){
                    const seconds = Math.ceil((time - Date.now()) / 1000);
                    const secondsString = seconds > 1 ? "Sekunden" : "Sekunde";
                    const cooldownEmbed = this.client.generateEmbed("Du musst noch {0} {1} warten, bis du diesen Befehl erneut nutzen kannst.", "error", "error", seconds, secondsString);
                    return interaction.editReply({ embeds: [cooldownEmbed] });
                }
            }
            interactionCooldowns[member.user.id][context.help.name] = Date.now() + context.conf.cooldown;

            const log = new this.client.logs({
                command: context.help.name,
                type: (interaction.isUserContextMenuCommand() ? "User Context Menu" : "Message Context Menu"),
                arguments: [],
                user: {
                    tag: member.user.tag,
                    id: member.user.id,
                    createdAt: member.user.createdAt,
                },
                guild: {
                    name: guild.name,
                    id: guild.id,
                    createdAt: guild.createdAt,
                },
                channel: {
                    name: channel.name,
                    id: channel.id,
                    createdAt: channel.createdAt
                }
            });
            log.save();
            try {
                return context.dispatch(interaction);
            }catch(exc){
                const errorEmbed = this.client.generateEmbed("Ein unerwarteter Fehler ist aufgetreten", "error", "error");
                return interaction.editReply({ embeds: [errorEmbed] });
                // TODO: Error an supportserver loggen
            }
        }

        // ----------------------------------
        // --- HANDLE SUGGESTION REACTIONS --
        // ----------------------------------
        if(interaction.isButton()){
            let splittedButtonId = interaction.customId.split("_");
            if(!splittedButtonId) return;

            // User voted
            if(splittedButtonId[0] === "suggestion"){
                new(require("@events/interaction/seperations/suggestion/Voted"))(this.client).dispatch(interaction, splittedButtonId, data);
            }
            // Moderator wants to review suggestion
            if(splittedButtonId[0] === "review"){
                new(require("@events/interaction/seperations/suggestion/Reviewed"))(this.client).dispatch(interaction, splittedButtonId, data, guild);
            }
        }

        // ----------------------------
        // --- HANDLE SLASH COMMANDS --
        // ----------------------------
        if(interaction.isCommand()){
            const command = this.client.commands.get(interaction.commandName);
            if(!command) return;
            await interaction.deferReply().catch(() => {});
            const args = interaction.options?._hoistedOptions || [];

            // USER IS BLOCKED
            if(data.user.blocked.state){
                const reason = data.user.blocked.reason || "Kein Grund angegeben";
                const blockedEmbed = this.client.generateEmbed("Du wurdest von {0} blockiert und kannst keine Befehle mehr nutzen.\n{1} Grund: {2}", "error", "error", this.client.user.username, this.client.emotes.arrow, reason);
                return interaction.editReply({ embeds: [blockedEmbed] });
            }

            // GUILD IS BLOCKED
            if(data.guild.blocked.state){
                const reason = data.guild.blocked.reason || "Kein Grund angegeben";
                const blockedEmbed = this.client.generateEmbed("Da dieser Server von {0} blockiert wurde, können Befehle hier nicht mehr genutzt werden.\n{1} Grund: {2}", "error", "error", this.client.user.username, this.client.emotes.arrow, reason);
                return interaction.editReply({ embeds: [blockedEmbed] });
            }

            // CHECK IF BOT HAS ALL NEEDED PERMISSIONS
            const neededBotPermissions = [];
            guild.me = await guild.members.fetch(this.client.user.id);
            if(!command.conf.botPermissions.includes("EmbedLinks")) command.conf.botPermissions.push("EmbedLinks");
            for(let permission of command.conf.botPermissions){
                if(!channel.permissionsFor(guild.me).has(PermissionsBitField.Flags[permission])){
                    neededBotPermissions.push(this.client.permissions[permission]);
                }
            }
            if(neededBotPermissions.length > 0){
                const missingPermissionEmbed = this.client.generateEmbed("Folgende Berechtigungen fehlen mir, um den Befehl ausführen zu können:\n\n{0} {1}", "error", "error", this.client.emotes.arrow, neededBotPermissions.join("\n" + this.client.emotes.arrow + " "));
                return interaction.editReply({ embeds: [missingPermissionEmbed] });
            }

            // COMMAND IS NSFW
            if (!channel.nsfw && command.conf.nsfw) {
                const nsfwEmbed = this.client.generateEmbed("Dieser Befehl darf nur in NSFW-Channels genutzt werden.", "error", "error");
                return interaction.editReply({ embeds: [nsfwEmbed] });
            }

            // COMMAND IS DISABLED
            const disabledCommands = JSON.parse(fs.readFileSync("./assets/disabled.json"));
            if(disabledCommands.includes(command.help.name)){
                // STAFFS AND OWNERS CAN USE DISABLED COMMANDS
                if(!data.user.staff.state && !this.client.config.general["OWNER_IDS"].includes(member.user.id)){
                    const disabledEmbed = this.client.generateEmbed("Dieser Befehl ist derzeit deaktiviert.", "error", "error");
                    return interaction.editReply({ embeds: [disabledEmbed] });
                }
            }

            // USER IS IN COOLDOWN
            let userCooldown =interactionCooldowns[member.user.id];
            if(!userCooldown){
                interactionCooldowns[member.user.id] = {};
                userCooldown = interactionCooldowns[member.user.id];
            }
            const time = userCooldown[command.help.name] || 0;
            if(time > Date.now()){
                // STAFFS DONT HAVE COOLDOWNS
                if(!data.user.staff.state){
                    const seconds = Math.ceil((time - Date.now()) / 1000);
                    const secondsString = seconds > 1 ? "Sekunden" : "Sekunde";
                    const cooldownEmbed = this.client.generateEmbed("Du musst noch {0} {1} warten, bis du diesen Befehl erneut nutzen kannst.", "error", "error", seconds, secondsString);
                    return interaction.editReply({ embeds: [cooldownEmbed] });
                }
            }
            interactionCooldowns[member.user.id][command.help.name] = Date.now() + command.conf.cooldown;

            // WRITE LOG TO DATABASE
            const log = new this.client.logs({
                command: command.help.name,
                type: "Slash command",
                arguments: args,
                user: {
                    tag: member.user.tag,
                    id: member.user.id,
                    createdAt: member.user.createdAt,
                },
                guild: {
                    name: interaction.guild.name,
                    id: interaction.guild.id,
                    createdAt: interaction.guild.createdAt,
                },
                channel: {
                    name: channel.name,
                    id: channel.id,
                    createdAt: channel.createdAt
                }
            });
            log.save();

            // EXECUTE COMMAND
            try {
                command.dispatch(interaction, data)
            }catch (e) {
                const errorEmbed = this.client.generateEmbed("Ein unerwarteter Fehler ist aufgetreten", "error", "error");
                return interaction.editReply({ embeds: [errorEmbed] });
            }
        }
    }
}
