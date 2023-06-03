const path = require("path");
const { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const toml = require("toml");
const fs = require("fs");
const giveawaysHandler = require("@handlers/giveaway");
const Logger = require("@helpers/Logger");

module.exports = class BaseClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits["Guilds"], GatewayIntentBits["GuildMembers"],
                GatewayIntentBits["GuildMessageReactions"], GatewayIntentBits["GuildVoiceStates"],
                GatewayIntentBits["GuildBans"], GatewayIntentBits["GuildMessages"],
                GatewayIntentBits["GuildMessageTyping"], GatewayIntentBits["GuildEmojisAndStickers"],
                GatewayIntentBits["GuildScheduledEvents"], GatewayIntentBits["GuildInvites"],
            ],
            partials: [
                Partials.User, Partials.Message,
                Partials.Reaction, Partials.Channel,
                Partials.GuildMember, Partials.GuildScheduledEvent,
                Partials.ThreadMember
            ],
            allowedMentions: {
                parse: ["users"]
            }
        });

        this.wait = require("util").promisify(setTimeout);
        this.config = toml.parse(fs.readFileSync("./config.toml", "utf8"));
        this.emotes = require("../../assets/emojis.json");
        this.support = this.config.support["INVITE"];
        this.permissions = require("@helpers/Permissions");

        this.commands = new Collection();
        this.contextMenus = new Collection();

        this.giveawayManager = giveawaysHandler(this);
        this.logger = Logger;
        this.utils = require("@helpers/Utils");

        this.logs = require('@schemas/Log');
        this.guildsData = require('@schemas/Guild');
        this.usersData = require('@schemas/User');
        this.membersData = require('@schemas/Member');
        this.giveawaysData = require('@schemas/Giveaway');

        this.databaseCache = {};
        this.databaseCache.users = new Collection();
        this.databaseCache.guilds = new Collection();
        this.databaseCache.members = new Collection();
        this.databaseCache.bannedUsers = new Collection();
        this.databaseCache.mutedUsers = new Collection();
        this.databaseCache.reminders = new Collection();
        this.invites = new Collection();
    }

    // Database methods
    async findOrCreateUser({ id: userID }, isLean){
        if(this.databaseCache.users.get(userID)){
            return isLean ? this.databaseCache.users.get(userID).toJSON() : this.databaseCache.users.get(userID);
        } else {
            let userData = (isLean ? await this.usersData.findOne({ id: userID }).lean() : await this.usersData.findOne({ id: userID }));
            if(userData){
                if(!isLean) this.databaseCache.users.set(userID, userData);
                return userData;
            } else {
                userData = new this.usersData({ id: userID });
                await userData.save();
                this.databaseCache.users.set(userID, userData);
                return isLean ? userData.toJSON() : userData;
            }
        }
    }

    async findUser(userId) {
        const cachedUser = this.databaseCache.users.get(userId);
        if(cachedUser) return cachedUser;
        return await this.usersData.findOne({id: userId});
    }

    async deleteUser({ id: userID }){
        if(this.databaseCache.users.get(userID)){
            await this.usersData.findOneAndDelete({id: userID}).catch((e) => {
                this.alertException(e, null, null, "<Client>.deleteUser(\"" + userID + "\")")
            });
            this.databaseCache.users.delete(userID);
        }
    }

    async findOrCreateMember({ id: memberID, guildID }, isLean){
        if(this.databaseCache.members.get(`${memberID}${guildID}`)){
            return isLean ? this.databaseCache.members.get(`${memberID}${guildID}`).toJSON() : this.databaseCache.members.get(`${memberID}${guildID}`);
        } else {
            let memberData = (isLean ? await this.membersData.findOne({ guildID, id: memberID }).lean() : await this.membersData.findOne({ guildID, id: memberID }));
            if(memberData){
                if(!isLean) this.databaseCache.members.set(`${memberID}${guildID}`, memberData);
                return memberData;
            } else {
                memberData = new this.membersData({ id: memberID, guildID: guildID });
                await memberData.save();
                const guild = await this.findOrCreateGuild({ id: guildID });
                if(guild){
                    guild.members.push(memberData._id);
                    await guild.save().catch((e) => {
                        this.alertException(e, null, null, "await <GuildData>.save()");
                    });
                }
                this.databaseCache.members.set(`${memberID}${guildID}`, memberData);
                return isLean ? memberData.toJSON() : memberData;
            }
        }
    }

    async findMember(memberId, guildId) {
        const cachedMember = this.databaseCache.members.get(`${memberId}${guildId}`);
        if(cachedMember) return cachedMember;
        return await this.membersData.findOne({id: memberId, guildID: guildId});
    }

    async deleteMember({id: memberID, guildID}){
        if(this.databaseCache.members.get(`${memberID}${guildID}`)){
            await this.membersData.findOne({id: memberID, guildID: guildID}).deleteOne().exec().catch((e) => {
                this.alertException(e, null, null, "<Client>.deleteMember(\"" + memberID + "\", " + guildID + "\")");
            });
            this.databaseCache.members.delete(`${memberID}${guildID}`);
        }
    }

    async findOrCreateGuild({ id: guildID }, isLean) {
        if (this.databaseCache.guilds.get(guildID)) {
            return isLean ? this.databaseCache.guilds.get(guildID).toJSON() : this.databaseCache.guilds.get(guildID);
        } else {
            let guildData = (isLean ? await this.guildsData.findOne({id: guildID}).populate("members").lean() : await this.guildsData.findOne({id: guildID}).populate("members"));
            if (guildData) {
                if (!isLean) this.databaseCache.guilds.set(guildID, guildData);
                return guildData;
            } else {
                guildData = new this.guildsData({id: guildID});
                await guildData.save();
                this.databaseCache.guilds.set(guildID, guildData);
                return isLean ? guildData.toJSON() : guildData;
            }
        }
    }

    async findGuild(guildId) {
        const cachedGuild = this.databaseCache.guilds.get(guildId);
        if(cachedGuild) return cachedGuild;
        return await this.guildsData.findOne({id: guildId});
    }

    async deleteGuild({id: guildID}){
        if(this.databaseCache.guilds.get(guildID)){
            await this.guildsData.findOne({id: guildID}).deleteOne().exec().catch((e) => {
                this.alertException(e, null, null, "<Client>.deleteGuild(\"" + guildID + "\")");
            });
            this.databaseCache.guilds.delete(guildID);
        }
    }

    
    // Command methods
    loadCommand (commandPath, commandName) {
        try {
            const props = new (require(`${commandPath}/${commandName}`))(this);
            props.conf.location = commandPath;
            if (props.init){
                props.init(this);
            }
            this.commands.set(props.help.name, props);
            return false;
        } catch (exception) {
            return exception;
        }
    }

    async unloadCommand (commandPath, commandName) {
        let command;
        if(this.commands.has(commandName)) {
            command = this.commands.get(commandName);
        }
        if(!command){
            return `Command not found: ${commandName}`;
        }
        if(command.shutdown){
            await command.shutdown(this);
        }
        delete require.cache[require.resolve(`${commandPath}${path.sep}${commandName}.js`)];
        return false;
    }


    // Utility methods
    format(integer){
        return new Intl.NumberFormat("de-DE").format(integer);
    }

    createEmbed(message, emote, type, ...args) {
        let color = type
            .replace("normal", this.config.embeds["DEFAULT_COLOR"])
            .replace("success", this.config.embeds["SUCCESS_COLOR"])
            .replace("warning", this.config.embeds["WARNING_COLOR"])
            .replace("transparent", this.config.embeds["TRANSPARENT_COLOR"])
            .replace("error", this.config.embeds["ERROR_COLOR"]);

        let formattedMessage = message;
        for(let i = 0; i < args.length; i++){
            formattedMessage = formattedMessage.replaceAll("{" + i + "}", args[i]);
        }

        return new EmbedBuilder()
            .setAuthor({ name: this.user.username, iconURL: this.user.displayAvatarURL(), url:  this.config.general["WEBSITE"] })
            .setDescription((emote ? (this.emotes[emote] + " ") : "") + (formattedMessage ? formattedMessage : " "))
            .setColor(color)
            .setFooter({ text: this.config.embeds["FOOTER_TEXT"] });
    }

    createButton(customId, label, style, emote = null, disabled = false, url = null){
        const button = new ButtonBuilder()
            .setLabel(label ? label : " ")
            .setStyle(ButtonStyle[style])
            .setDisabled(disabled)

        if(customId && !url) button.setCustomId(customId);
        if(!customId && url) button.setURL(url);
        if(emote && this.emotes[emote]) button.setEmoji(this.emotes[emote]);
        else if(emote) button.setEmoji(emote);

        return button;
    }

    createMessageComponentsRow(...components){
        return new ActionRowBuilder().addComponents(components);
    }

    createInvite() {
        return this.generateInvite({
            scopes: ["bot", "applications.commands"],
            permissions: [
                "ViewAuditLog", "ManageRoles", "ManageChannels", "KickMembers", "BanMembers",
                "ManageGuildExpressions", "ManageWebhooks", "ViewChannel", "SendMessages",
                "ManageMessages", "AttachFiles", "EmbedLinks", "ReadMessageHistory", "UseExternalEmojis",
                "AddReactions",  "ManageGuild"
            ]
        })
    }

    alertException(exception, guild = null, user = null, action = null){
        const supportGuild = this.guilds.cache.get(this.config.support["ID"]);
        const errorLogChannel = supportGuild?.channels.cache.get(this.config.support["ERROR_LOG"]);
        if(!supportGuild || !errorLogChannel) return;

        const exceptionEmbed = this.createEmbed("Ein Fehler ist aufgetreten", "error", "error");
        let description = exceptionEmbed.data.description;

        if(guild) description += "\n" + this.emotes.arrow + " Server: " + guild;
        if(user) description += "\n" + this.emotes.arrow + " Nutzer: " + user.tag + " (" + user.id + ")";
        if(action) description += "\n" + this.emotes.arrow + " Aktion: " + action;
        description += "\n```js\n" + exception.toString() + "```";

        exceptionEmbed.setDescription(description);
        exceptionEmbed.setThumbnail(this.user.displayAvatarURL({ dynamic: true }));
        return errorLogChannel.send({ embeds: [exceptionEmbed] }).catch(() => {});
    }

    alert(text, color){
        const supportGuild = this.guilds.cache.get(this.config["support"]["ID"]);
        if(!supportGuild) return;
        const logChannel = supportGuild.channels.cache.get(this.config["support"]["BOT_LOG"]);
        if(!logChannel) return;

        const embed = this.createEmbed(text, "information", color);
        embed.setThumbnail(this.user.displayAvatarURL({ dynamic: true }));
        return logChannel.send({embeds: [embed]});
    }

    async resolveUser(query, exact = false) {
        const USER_MENTION = /<?@?!?(\d{17,20})>?/;

        if (!query || typeof query !== "string") return;

        const patternMatch = query.match(USER_MENTION);
        if (patternMatch) {
            const id = patternMatch[1];
            const fetched = await this.users.fetch(id, {cache: true}).catch(() => {
            });
            if (fetched) return fetched;
        }

        const matchingTags = this.users.cache.filter((user) => user.tag === query);
        if (matchingTags.size === 1) return matchingTags.first();

        if (!exact) {
            return this.users.cache.find(
                (x) =>
                    x.username === query ||
                    x.username.toLowerCase().includes(query.toLowerCase()) ||
                    x.tag.toLowerCase().includes(query.toLowerCase())
            );
        }
    }
}
