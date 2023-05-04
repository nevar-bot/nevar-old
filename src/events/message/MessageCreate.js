const Levels = require('discord-xp');

module.exports = class {
    constructor(client) {
        this.client = client;
        this.timeouts = new Set();
    }
    async dispatch(message) {
        if (!message || !message.member || !message.guild || !message.guild.available) return;

        // ------------------------
        // --- BASIC INFORMATION --
        // ------------------------
        const guild = message.guild;
        const member = message.member;
        const channel = message.channel;

        const data = {
            config: this.client.config,
            guild: await this.client.findOrCreateGuild({id: message.guild.id}),
            member: await this.client.findOrCreateMember({id: message.author.id, guildID: message.guild.id}),
            user: await this.client.findOrCreateUser({id: message.author.id})
        };

        // -----------------
        // --- AFK SYSTEM --
        // -----------------

        // AUTHOR MENTIONS AFK USER
        if((message.mentions.repliedUser || message.mentions.users) && !message.author.bot){
            this.client.emit("MemberIsAway", message, data, guild);
        }

        // AUTHOR IS AFK
        if(data.user.afk.state){
            this.client.emit("MemberIsBack", message, data, guild);
        }

        // MENTIONED BOT
        if (message.content.match(new RegExp(`^<@!?${this.client.user.id}>( |)$`)) && !message.author.bot) {

            const currentHour = new Date().getHours();
            const greetings = [
                [ 0, 5, "Gute Nacht" ],
                [ 5, 10, "Guten Morgen" ],
                [ 11, 13, "Guten Mittag" ],
                [ 14, 17, "Guten Tag" ],
                [ 18, 23, "Guten Abend" ]
            ]

            let greeting;
            for(let i = 0; i < greetings.length; i++){
                if(currentHour >= greetings[i][0] && currentHour <= greetings[i][1]){
                    greeting = greetings[i][2] + " " + message.author.username + "!";
                }
            }

            const helpCommand = (await this.client.application.commands.fetch()).find(command => command.name === "help");
            const text =
                "**{0}**" +
                "\n\n{1} Ich bin {2} und helfe dir bei der Verwaltung deines Servers." +
                "\n{1} Eine Übersicht meiner Befehle erhältst du durch folgenden Befehl: {3}"

            const helpEmbed = this.client.generateEmbed(text, "wave", "normal", greeting, this.client.emotes.arrow, this.client.user.username, (helpCommand ? "</" + helpCommand.name + ":" + helpCommand.id + ">" : "/help"));
            helpEmbed.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }));

            const inviteButton = this.client.createButton(null, "Einladen", "Link", null, false, this.client.getInvite());
            const buttonRow = this.client.createComponentsRow(inviteButton);

            return message.reply({ embeds: [helpEmbed ], components: [buttonRow] });
        }else if(message.content){
            const splittedMessage = message.content.split(" ");

            // remove bot mention from array
            splittedMessage.shift();

            // seperate command from arguments
            const command = splittedMessage.shift();

            // set arguments
            const args = splittedMessage;

            // Check if command is a staff or owner command
            const clientCommand = this.client.commands.get(command);
            if(!clientCommand || !clientCommand.conf.staffOnly && !clientCommand.conf.ownerOnly) return;
            if(!data.user.staff.state && !this.client.config.general["OWNER_IDS"].includes(message.author.id)) return;
            if(clientCommand.help.category === "owner" && data.user.staff.role !== "owner" && !this.client.config.general["OWNER_IDS"].includes(message.author.id)) return;

            try {
                clientCommand.dispatch(message, args, data);
            }catch(e){
                return this.client.logException(e, message.guild, message.author, "<ClientMessageCommand>.dispatch(<Message>, <Args>, <Data>)");
            }
        }

        // AUTODELETE
        if(data.guild.settings.autodelete && data.guild.settings.autodelete.length > 0){
            for(let autodelete of data.guild.settings.autodelete){
                const channelId = autodelete.split("|")[0];
                const time = autodelete.split("|")[1];
                if(channelId !== message.channel.id) continue;
                this.client.wait(Number(time)).then(() => {
                   if(!message.pinned) message.delete().catch((exception) => {
                       const logText =
                           " **Löschen von Nachricht durch Autodelete fehlgeschlagen**";
                       return guild.logAction(logText, "guild", this.client.emotes.error, "error");
                  });
                });
            }
        }

        // AUTOREACT
        if(data.guild.settings.autoreact && data.guild.settings.autoreact.length > 0){
            for(let autoreact of data.guild.settings.autoreact){
                const channelId = autoreact.split("|")[0];
                const emoji = autoreact.split("|")[1];
                if(channelId !== message.channel.id) continue;
                message.react(emoji).catch((exception) => {
                    const logText =
                        " **Reagieren auf Nachricht durch Autoreact fehlgeschlagen**";
                    return guild.logAction(logText, "guild", this.client.emotes.error, "error");
                });
            }
        }

        // LEVELING
        if (message.author.bot) return;

        if(data.guild.settings.levels.enabled){
            // random xp amount
            const minXp = data.guild.settings.levels.xp.min || 1;
            const maxXp = data.guild.settings.levels.xp.max || 30;

            // check excluded channels and roles
            if(data.guild.settings.levels.exclude){
                for(let excludedRoleId of data.guild.settings.levels.exclude.roles){
                    if(message.member.roles.cache.get(excludedRoleId)) return;
                }
                for(let excludedChannelId of data.guild.settings.levels.exclude.channels){
                    if(message.channel.id === excludedChannelId) return;
                }
            }

            let xp = this.client.utils.getRandomInt(minXp, maxXp);

            // double xp
            if(data.guild.settings.levels.doubleXP && data.guild.settings.levels.doubleXP.length > 0){
                for(let doubleXP of data.guild.settings.levels.doubleXP){
                    if(message.member.roles.cache.get(doubleXP)){
                        xp = xp * 2;
                    }
                }
            }

            // check if user leveled up
            if(!this.timeouts.has(message.author.id)){
                const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, xp);
                const levelUser = await Levels.fetch(message.author.id, message.guild.id, true);

                if(hasLeveledUp){
                    const newLevel = Number(levelUser.level);
                    // level roles
                    if(data.guild.settings.levels.roles && data.guild.settings.levels.roles.length > 0){
                        for(let levelRole of data.guild.settings.levels.roles){
                            const roleId = levelRole.split("|")[0];
                            const level = levelRole.split("|")[1];
                            if(Number(level) === newLevel || Number(level) < newLevel){
                                message.member.roles.add(roleId).catch((exception) => {
                                    const logText =
                                        " **Vergeben von Levelrolle fehlgeschlagen**";
                                    return guild.logAction(logText, "guild", this.client.emotes.error, "error");
                                });
                            }
                        }
                    }

                    // level up message
                    function parseMessage(str){
                        return str
                            .replaceAll(/{level}/g, newLevel)
                            .replaceAll(/{user}/g, message.author)
                            .replaceAll(/{user:username}/g, message.author.username)
                            .replaceAll(/{user:tag}/g, message.author.tag)
                            .replaceAll(/{user:discriminator}/g, message.author.discriminator)
                            .replaceAll(/{user:nickname}/g, message.member.nickname)
                            .replaceAll(/{user:id}/g, message.author.id)
                            .replaceAll(/{server:name}/g, message.guild.name)
                            .replaceAll(/{server:id}/g, message.guild.id)
                            .replaceAll(/{server:membercount}/g, message.guild.memberCount)
                    }

                    const parsedMessage = parseMessage(data.guild.settings.levels.message);

                    const channel = message.guild.channels.cache.get(data.guild.settings.levels.channel) || message.channel;
                    if(!channel) return;

                    channel.send({ content: parsedMessage }).catch((exception) => {
                        const logText =
                            " **Senden von Level-Up-Nachricht fehlgeschlagen**";
                        return guild.logAction(logText, "guild", this.client.emotes.error, "error");
                    });

                }
                this.timeouts.add(message.author.id);
                setTimeout(() => this.timeouts.delete(message.author.id), 15000);
            }
        }
    }
}
