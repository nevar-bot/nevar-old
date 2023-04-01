const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, ChannelType } = require('discord.js');

class Levelsystem extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "levelsystem",
            description: "Verwaltet das Levelsystem",

            memberPermissions: ["ManageGuild"],

            cooldown: 2000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addSubcommand(subcommand => subcommand
                            .setName("status")
                            .setDescription("Legt fest, ob das Levelsystem aktiviert oder deaktiviert ist")
                            .addStringOption(option => option
                                .setName("status")
                                .setRequired(true)
                                .setDescription("Wähle einen Status")
                                .addChoices(
                                    { name: "an", value: "true"},
                                    { name: "aus", value: "false"}
                                )
                            )
                        )
                        .addSubcommand(subcommand => subcommand
                            .setName("channel")
                            .setDescription("Bestimmt in welchem Channel Level-Up Nachrichten gesendet werden")
                            .addChannelOption(option => option
                                .setName("channel")
                                .setDescription("Wähle einen Channel (wenn jeweils aktueller Channel gewünscht, leer lassen)")
                                .setRequired(false)
                                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                            )
                        )
                        .addSubcommand(subcommand => subcommand
                            .setName("nachricht")
                            .setDescription("Setzt die Level-Up Nachricht")
                            .addStringOption(option => option
                                .setName("nachricht")
                                .setDescription("Lege die Nachricht fest")
                                .setRequired(true)
                            )
                        )
                        .addSubcommand(subcommand => subcommand
                            .setName("rollen")
                            .setDescription("Legt Rollen fest, die bei Erreichen eines bestimmten Levels vergeben werden")
                            .addStringOption(option => option
                                .setName("aktion")
                                .setDescription("Wähle eine Aktion")
                                .setRequired(true)
                                .addChoices(
                                    { name: "hinzufügen", value: "add" },
                                    { name: "entfernen", value: "remove" },
                                    { name: "liste", value: "list" }
                                )
                            )
                            .addRoleOption(option => option
                                .setName("rolle")
                                .setDescription("Wähle eine Rolle")
                                .setRequired(false)
                            )
                            .addIntegerOption(option => option
                                .setName("level")
                                .setDescription("Bei welchem Level die Rolle vergeben wird")
                                .setRequired(false)
                                .setMinValue(1)
                                .setMaxValue(1000)
                            )
                        )
                        .addSubcommand(subcommand => subcommand
                            .setName("doppelxp")
                            .setDescription("Bestimmt, welche Rollen doppeltes XP bekommen")
                            .addStringOption(option => option
                                .setName("aktion")
                                .setDescription("Wähle eine Aktion")
                                .setRequired(true)
                                .addChoices(
                                    { name: "hinzufügen", value: "add" },
                                    { name: "entfernen", value: "remove" },
                                    { name: "liste", value: "list" }
                                )
                            )
                            .addRoleOption(option => option
                                .setName("rolle")
                                .setDescription("Wähle eine Rolle")
                                .setRequired(false)
                            )
                        )
                        .addSubcommand(subcommand => subcommand
                            .setName("xp")
                            .setDescription("Definiere die minimale und maximale Anzahl an XP, die pro Nachricht vergeben werden können")
                            .addIntegerOption(option => option
                                .setName("min")
                                .setDescription("Wähle die minimale Anzahl an XP")
                                .setRequired(true)
                                .setMinValue(1)
                                .setMaxValue(500)
                            )
                            .addIntegerOption(option => option
                                .setName("max")
                                .setDescription("Wähle die maximale Anzahl an XP")
                                .setRequired(true)
                                .setMinValue(1)
                                .setMaxValue(500)
                            )
                        )
                        .addSubcommand(subcommand => subcommand
                            .setName("variablen")
                            .setDescription("Listet alle Variablen, die in der Level-Up Nachricht verwendet werden können")
                        )
                        .addSubcommand(subcommand => subcommand
                            .setName("test")
                            .setDescription("Testet die Level-Up Nachricht")
                        )
                        .addSubcommand(subcommand => subcommand
                            .setName("exclude")
                            .setDescription("Fügt einen Channel oder eine Rolle zur Blacklist hinzu")
                            .addStringOption(option => option
                                .setName("aktion")
                                .setDescription("Wähle eine Aktion")
                                .setRequired(true)
                                .addChoices(
                                    { name: "hinzufügen", value: "add" },
                                    { name: "entfernen", value: "remove" },
                                    { name: "liste", value: "list" }
                                )
                            )
                            .addChannelOption(option => option
                                .setName("channel")
                                .setDescription("Wähle einen Channel")
                                .setRequired(false)
                                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                            )
                            .addRoleOption(option => option
                                .setName("rolle")
                                .setDescription("Wähle eine Rolle")
                                .setRequired(false)
                            )
                        )
            }
        });
    }

    static interaction;

    async dispatch(interaction, data){
        this.interaction = interaction;

        const subcommand = interaction.options.getSubcommand();

        switch(subcommand){
            case "status":
                await this.setStatus(interaction.options.getString("status"), data);
                break;
            case "channel":
                await this.setChannel(interaction.options.getChannel("channel"), data);
                break;
            case "nachricht":
                await this.setMessage(interaction.options.getString("nachricht"), data);
                break;
            case "rollen":
                const levelroleAction = interaction.options.getString("aktion");
                switch(levelroleAction){
                    case "add":
                        await this.addRole(interaction.options.getRole("rolle"), interaction.options.getInteger("level"), data);
                        break;
                    case "remove":
                        await this.removeRole(interaction.options.getRole("rolle"), data);
                        break;
                    case "list":
                        await this.listRoles(data);
                        break;
                }
                break;
            case "doppelxp":
                const doubleXpAction = interaction.options.getString("aktion");
                switch(doubleXpAction){
                    case "add":
                        await this.addDoubleXp(interaction.options.getRole("rolle"), data);
                        break;
                    case "remove":
                        await this.removeDoubleXp(interaction.options.getRole("rolle"), data);
                        break;
                    case "list":
                        await this.listDoubleXp(data);
                        break;
                }
                break;
            case "xp":
                await this.setXp(interaction.options.getInteger("min"), interaction.options.getInteger("max"), data);
                break;
            case "variablen":
                await this.listVariables();
                break;
            case "test":
                await this.sendPreview(data);
                break;
            case "exclude":
                const excludeAction = interaction.options.getString("aktion");
                switch(excludeAction){
                    case "add":
                        await this.addExclude(interaction.options.getChannel("channel"), interaction.options.getRole("rolle"), data);
                        break;
                    case "remove":
                        await this.removeExclude(interaction.options.getChannel("channel"), interaction.options.getRole("rolle"), data);
                        break;
                    case "list":
                        await this.listExcluded(data);
                        break;
                }
        }
    }

    async setStatus(status, data){
        // This status is already chosen
        if(data.guild.settings.levels.enabled === JSON.parse(status)){
            const text = JSON.parse(status) ? "aktiviert" : "deaktiviert";
            const infoEmbed = this.client.generateEmbed("Das Levelsystem ist bereits {0}.", "error", "error", text);
            return this.interaction.followUp({ embeds: [infoEmbed] });
        }

        // Save to database
        data.guild.settings.levels.enabled = JSON.parse(status);
        data.guild.markModified("settings.levels.enabled");
        await data.guild.save();
        const text = JSON.parse(status) ? "aktiviert" : "deaktiviert";
        const successEmbed = this.client.generateEmbed("Das Levelsystem wurde {0}.", "success", "success", text);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async setChannel(channel, data){
        // Levelsystem is disabled
        if(!data.guild.settings.levels.enabled){
            const errorEmbed = this.client.generateEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        // Save to database
        data.guild.settings.levels.channel = channel ? channel.id : null;
        data.guild.markModified("settings.levels.channel");
        await data.guild.save();

        const text = channel ? "in " + channel.toString() : "im jeweils aktuellen Channel";
        const successEmbed = this.client.generateEmbed("Level-Up Nachrichten kommen absofort {0}.", "success", "success", text);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async setMessage(message, data){
        // Levelsystem is disabled
        if(!data.guild.settings.levels.enabled){
            const errorEmbed = this.client.generateEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        // Message is too long
        if(message.length > 2000){
            const errorEmbed = this.client.generateEmbed("Die Nachricht darf maximal 2.000 Zeichen lang sein.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        // Save to database
        data.guild.settings.levels.message = message;
        data.guild.markModified("settings.levels.message");
        await data.guild.save();

        const successEmbed = this.client.generateEmbed("Die Level-Up Nachricht wurde geändert.", "success", "success");
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async addRole(role, level, data){
        // Levelsystem is disabled
        if(!data.guild.settings.levels.enabled){
            const errorEmbed = this.client.generateEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        // Missing options
        if(!role || !role.id || !level){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst eine Rolle und ein Level angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        // Role is already added
        if(data.guild.settings.levels.roles.find(r => r.split("|")[0] === role.id)){
            const alreadyAddedEmbed = this.client.generateEmbed("Diese Rolle ist bereits als Levelrolle hinzugefügt.", "error", "error");
            return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
        }

        // Role is @everyone
        if(role.id === this.interaction.guild.roles.everyone.id){
            const everyoneEmbed = this.client.generateEmbed("Die @everyone Rolle kann nicht als eine Levelrolle hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [everyoneEmbed] });
        }

        // Role is managed by an integration
        if(role.managed){
            const roleIsManagedEmbed = this.client.generateEmbed("Rollen welche durch eine Integration verwaltet werden, können nicht als Levelrolle hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
        }

        // Role is higher than the bot's highest role
        if(this.interaction.guild.members.me.roles.highest.position <= role.position){
            const roleIsTooHighEmbed = this.client.generateEmbed("Da {0} eine höhere oder gleiche Position wie meine höchste Rolle ({1}) hat, kann sie nicht als Levelrolle hinzugefügt werden.", "error", "error", role, this.interaction.guild.members.me.roles.highest);
            return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
        }

        // Save to database
        data.guild.settings.levels.roles.push(role.id + "|" + level);
        data.guild.markModified("settings.levels.roles");
        await data.guild.save();

        const successEmbed = this.client.generateEmbed("{0} wurde als Levelrolle hinzugefügt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async removeRole(role, data){
        // Levelsystem is disabled
        if(!data.guild.settings.levels.enabled){
            const errorEmbed = this.client.generateEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        // Missing options
        if(!role || !role.id){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst eine Rolle angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        // Role is not a levelrole
        if(!data.guild.settings.levels.roles.find(r => r.split("|")[0] === role.id)){
            const isNoLevelroleEmbed = this.client.generateEmbed("{0} ist keine Levelrolle.", "error", "error", role);
            return this.interaction.followUp({ embeds: [isNoLevelroleEmbed] });
        }

        // Remove from database
        data.guild.settings.levels.roles = data.guild.settings.levels.roles.filter(r => r.split("|")[0] !== role.id);
        data.guild.markModified("settings.levels.roles");
        await data.guild.save();

        const successEmbed = this.client.generateEmbed("{0} wurde als Levelrolle entfernt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async listRoles(data){
        let response = data.guild.settings.levels.roles;
        const roleNamesArray = [];

        for(let i = 0; i < response.length; i++){
            const cachedRole = this.interaction.guild.roles.cache.get(response[i].split("|")[0]);
            const level = response[i].split("|")[1];
            if(!cachedRole){
                response.splice(i, 1);
            }else{
                roleNamesArray.push("**" + cachedRole.name + "** - Level " + level);
            }
        }
        if(data.guild.settings.levels.roles !== response){
            data.guild.settings.levels.roles = response;
            data.guild.markModified("settings.levels.roles");
            await data.guild.save();
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, roleNamesArray, "Levelrollen", "Es sind keine Levelrollen vorhanden", "ping");
    }

    async addDoubleXp(role, data){
        // Levelsystem is disabled
        if(!data.guild.settings.levels.enabled){
            const errorEmbed = this.client.generateEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        // Missing options
        if(!role || !role.id){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst eine Rolle angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        // Role is already added
        if(data.guild.settings.levels.doubleXP.includes(role.id)){
            const alreadyAddedEmbed = this.client.generateEmbed("Diese Rolle ist bereits als Doppel-XP Rolle hinzugefügt.", "error", "error");
            return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
        }

        // Role is @everyone
        if(role.id === this.interaction.guild.roles.everyone.id){
            const everyoneEmbed = this.client.generateEmbed("Die @everyone Rolle kann nicht als eine Doppel-XP Rolle hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [everyoneEmbed] });
        }

        // Role is managed by an integration
        if(role.managed){
            const roleIsManagedEmbed = this.client.generateEmbed("Rollen welche durch eine Integration verwaltet werden, können nicht als Doppel-XP Rolle hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
        }

        // Save to database
        data.guild.settings.levels.doubleXP.push(role.id);
        data.guild.markModified("settings.levels.doubleXP");
        await data.guild.save();

        const successEmbed = this.client.generateEmbed("{0} wurde als Doppel-XP Rolle hinzugefügt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async removeDoubleXp(role, data){
        // Levelsystem is disabled
        if(!data.guild.settings.levels.enabled){
            const errorEmbed = this.client.generateEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        // Missing options
        if(!role || !role.id){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst eine Rolle angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        // Role is not a doublexp role
        if(!data.guild.settings.levels.doubleXP.includes(role.id)){
            const isNoDoubleXPRoleEmbed = this.client.generateEmbed("{0} ist keine Doppel-XP Rolle.", "error", "error", role);
            return this.interaction.followUp({ embeds: [isNoDoubleXPRoleEmbed] });
        }

        // Remove from database
        data.guild.settings.levels.doubleXP = data.guild.settings.levels.doubleXP.filter(r => r !== role.id);
        data.guild.markModified("settings.levels.doubleXP");
        await data.guild.save();

        const successEmbed = this.client.generateEmbed("{0} wurde als Doppel-XP Rolle entfernt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async listDoubleXp(data){
        let response = data.guild.settings.levels.doubleXP;
        const roleNamesArray = [];

        for(let i = 0; i < response.length; i++){
            const cachedRole = this.interaction.guild.roles.cache.get(response[i]);
            if(!cachedRole){
                response.splice(i, 1);
            }else{
                roleNamesArray.push("**" + cachedRole.name + "** ");
            }
        }
        if(data.guild.settings.levels.roles !== response){
            data.guild.settings.levels.roles = response;
            data.guild.markModified("settings.levels.roles");
            await data.guild.save();
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, roleNamesArray, "Doppel-XP Rollen", "Es sind keine Doppel-XP Rollen vorhanden", "ping");
    }

    async setXp(min, max, data){
        // Levelsystem is disabled
        if(!data.guild.settings.levels.enabled){
            const errorEmbed = this.client.generateEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        // Min is higher than max
        if(min > max){
            const errorEmbed = this.client.generateEmbed("Der Minimalwert darf nicht höher sein als der Maximalwert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        // Save to database
        data.guild.settings.levels.xp = {
            min: min,
            max: max
        };
        data.guild.markModified("settings.levels.xp");
        await data.guild.save();

        const successEmbed = this.client.generateEmbed("Der Minimalwert wurde auf {0} und der Maximalwert auf {1} gesetzt.", "success", "success", min, max);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async listVariables(){
        const variables = [
            "**{level}** - Zeigt das neue Level an",
            "**{user}** - Erwähnt das Mitglied",
            "**{user:username}** - Der Name des Mitglieds",
            "**{user:tag}** - Der volle Name des Mitglieds mit Discriminator",
            "**{user:discriminator}** - Der Discriminator des Mitglieds",
            "**{user:nickname}** - Der Nickname des Mitglieds auf diesem Server",
            "**{user:id}** - ID des Mitglieds",
            "**{server:name}** - Name des Servers",
            "**{server:id}** - ID des Servers",
            "**{server:membercount}** - Anzahl an Mitgliedern des Servers"
        ];
        await this.client.utils.sendPaginatedEmbed(this.interaction, 10, variables, "Verfügbare Variablen", "Es sind keine Variablen verfügbar", "shine");
    }

    async sendPreview(data){
        if(!data.guild.settings.levels.enabled){
            const notEnabledEmbed = this.client.generateEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [notEnabledEmbed] });
        }
        if(!data.guild.settings.levels.message){
            const noMessageEmbed = this.client.generateEmbed("Es wurde keine Nachricht für die Level-Up Nachricht festgelegt.", "error", "error");
            return this.interaction.followUp({ embeds: [noMessageEmbed] });
        }

        const member = this.interaction.member;
        const self = this;
        function parseMessage(str){
            return str
                .replaceAll(/{level}/g, 1)
                .replaceAll(/{user}/g, member)
                .replaceAll(/{user:username}/g, member.user.username)
                .replaceAll(/{user:tag}/g, member.user.tag)
                .replaceAll(/{user:discriminator}/g, member.user.discriminator)
                .replaceAll(/{user:nickname}/g, member.nickname)
                .replaceAll(/{user:id}/g, member.user.id)
                .replaceAll(/{server:name}/g, self.interaction.guild.name)
                .replaceAll(/{server:id}/g, self.interaction.guild.id)
                .replaceAll(/{server:membercount}/g, self.interaction.guild.memberCount)
        }

        const channel = this.client.channels.cache.get(data.guild.settings.levels.channel) || this.interaction.channel;
        const message = parseMessage(data.guild.settings.levels.message);

        try {
            await channel.send({ content: message });
            const successEmbed = this.client.generateEmbed("Die Level-Up Nachricht wurde getestet", "success", "success");
            return this.interaction.followUp({ embeds: [successEmbed] });
        }catch(e){
            const errorEmbed = this.client.generateEmbed("Die Level-Up Nachricht konnte nicht gesendet werden", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }
    }

    async addExclude(channel, role, data){
        if(!data.guild.settings.levels.exclude){
            data.guild.settings.levels.exclude = {
                channels: [],
                roles: []
            };
            data.guild.markModified("settings.levels.exclude");
            await data.guild.save();
        }
        // Levelsystem is disabled
        if(!data.guild.settings.levels.enabled){
            const errorEmbed = this.client.generateEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        const toExclude = channel || role;
        // No channel or role was given
        if(!toExclude || toExclude.constructor.name !== "TextChannel" && toExclude.constructor.name !== "Role"){
            const errorEmbed = this.client.generateEmbed("Bitte gib einen Channel oder eine Rolle an.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(toExclude.constructor.name === "TextChannel"){
            // Channel is already on the blacklist
            if(data.guild.settings.levels.exclude.channels.includes(toExclude.id)){
                const errorEmbed = this.client.generateEmbed("{0} ist bereits auf der Blacklist.", "error", "error", toExclude);
                return this.interaction.followUp({ embeds: [errorEmbed] });
            }

            // Save to database
            data.guild.settings.levels.exclude.channels.push(toExclude.id);
            data.guild.markModified("settings.levels.exclude.channels");
            await data.guild.save();
            const successEmbed = this.client.generateEmbed("{0} wurde zur Blacklist hinzugefügt.", "success", "success", toExclude);
            return this.interaction.followUp({ embeds: [successEmbed] });
        }else if(toExclude.constructor.name === "Role"){
            // Role is already on the blacklist
            if(data.guild.settings.levels.exclude.roles.includes(toExclude.id)){
                const errorEmbed = this.client.generateEmbed("{0} ist bereits auf der Blacklist.", "error", "error", toExclude);
                return this.interaction.followUp({ embeds: [errorEmbed] });
            }

            // Role is @everyone
            if(toExclude.id === this.interaction.guild.roles.everyone.id){
                const everyoneEmbed = this.client.generateEmbed("Die @everyone Rolle kann nicht auf die Blacklist gesetzt werden.", "error", "error");
                return this.interaction.followUp({ embeds: [everyoneEmbed] });
            }

            // Role is managed by an integration
            if(toExclude.managed){
                const roleIsManagedEmbed = this.client.generateEmbed("Rollen welche durch eine Integration verwaltet werden, können nicht auf die Blacklist gesetzt werden.", "error", "error");
                return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
            }

            // Save to database
            data.guild.settings.levels.exclude.roles.push(toExclude.id);
            data.guild.markModified("settings.levels.exclude.roles");
            await data.guild.save();
            const successEmbed = this.client.generateEmbed("{0} wurde zur Blacklist hinzugefügt.", "success", "success", toExclude);
            return this.interaction.followUp({ embeds: [successEmbed] });
        }
    }

    async removeExclude(channel, role, data){
        // Levelsystem is disabled
        if(!data.guild.settings.levels.enabled){
            const errorEmbed = this.client.generateEmbed("Das Levelsystem ist deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        const toExclude = channel || role;
        // No channel or role was given
        if(!toExclude || toExclude.constructor.name !== "TextChannel" && toExclude.constructor.name !== "Role"){
            const errorEmbed = this.client.generateEmbed("Bitte gib einen Channel oder eine Rolle an.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        if(toExclude.constructor.name === "TextChannel"){
            // Channel is not on the blacklist
            if(!data.guild.settings.levels.exclude.channels.includes(toExclude.id)){
                const errorEmbed = this.client.generateEmbed("{0} ist nicht auf der Blacklist.", "error", "error", toExclude);
                return this.interaction.followUp({ embeds: [errorEmbed] });
            }

            // Save to database
            data.guild.settings.levels.exclude.channels = data.guild.settings.levels.exclude.channels.filter(c => c !== toExclude.id);
            data.guild.markModified("settings.levels.exclude.channels");
            await data.guild.save();
            const successEmbed = this.client.generateEmbed("{0} wurde von der Blacklist entfernt.", "success", "success", toExclude);
            return this.interaction.followUp({ embeds: [successEmbed] });
        }else if(toExclude.constructor.name === "Role"){
            // Role is not on the blacklist
            if(!data.guild.settings.levels.exclude.roles.includes(toExclude.id)){
                const errorEmbed = this.client.generateEmbed("{0} ist nicht auf der Blacklist.", "error", "error", toExclude);
                return this.interaction.followUp({ embeds: [errorEmbed] });
            }

            // Save to database
            data.guild.settings.levels.exclude.roles = data.guild.settings.levels.exclude.roles.filter(r => r !== toExclude.id);
            data.guild.markModified("settings.levels.exclude.roles");
            await data.guild.save();
            const successEmbed = this.client.generateEmbed("{0} wurde von der Blacklist entfernt.", "success", "success", toExclude);
            return this.interaction.followUp({ embeds: [successEmbed] });
        }
    }

    async listExcluded(data){
        let response = data.guild.settings.levels.exclude;
        const excludedNamesArray = [];

        for(let i = 0; i < response.roles.length; i++){
            const cachedRole = this.interaction.guild.roles.cache.get(response.roles[i]);
            if(!cachedRole){
                response.roles.splice(i, 1);
            }else{
                excludedNamesArray.push(this.client.emotes.ping + " **" + cachedRole.name + "**");
            }
        }

        if(data.guild.settings.levels.exclude.roles !== response.roles){
            data.guild.settings.levels.exclude.roles = response.roles;
            data.guild.markModified("settings.levels.exclude.roles");
            await data.guild.save();
        }

        for(let i = 0; i < response.channels.length; i++){
            const cachedChannel = this.interaction.guild.channels.cache.get(response.channels[i]);
            if(!cachedChannel){
                response.channels.splice(i, 1);
            }else{
                excludedNamesArray.push(this.client.emotes.channel + " **" + cachedChannel.name + "**");
            }
        }

        if(data.guild.settings.levels.exclude.channels !== response.channels){
            data.guild.settings.levels.exclude.channels = response.channels;
            data.guild.markModified("settings.levels.exclude.channels");
            await data.guild.save();
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, excludedNamesArray, "Level-Blacklist", "Es sind keine Rollen oder Channel auf der Blacklist vorhanden", null);
    }
}

module.exports = Levelsystem;
