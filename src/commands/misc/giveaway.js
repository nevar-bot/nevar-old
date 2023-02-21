const Command = require('../../structures/BaseCommand');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, InteractionType } = require('discord.js');
const ms = require('ms');
const { SlashCommandBuilder } = require("discord.js");
const Resolver ="test";
const fetch = require('node-fetch');

class Giveaway extends Command {

    constructor(client) {
        super(client, {
            name: "giveaway",
            description: "misc/giveaway:general:description",
            memberPermissions: ["ManageGuild"],
            cooldown: 2000,
            dirname: __dirname,
            slashCommand: {
                addCommand: false,
                data:
                    new SlashCommandBuilder(),
            }
        });
    }

    async run(interaction, message, args, data) {
        const guild = interaction?.guild || message?.guild;
        const member = interaction?.member || message?.member;
        const channel = interaction?.channel || message?.channel;
        const user = interaction?.user || message?.author;

        function startGw(bot, gwChannel, gwDuration, gwWin, gwHost, gwWinners, gwCondition){
            bot.giveawaysManager.start(gwChannel, {
                duration: gwDuration,
                prize: gwWin,
                exemptMembers: (member) => member.user.id === gwHost.user.id,
                hostedBy: gwHost,
                winnerCount: gwWinners,
                thumbnail: guild.iconURL(),
                messages: {
                    giveaway: guild.translate("misc/giveaway:main:gwMessages:giveaway")
                        .replaceAll('{emotes.giveaway}', bot.emotes.giveaway),
                    giveawayEnded: guild.translate("misc/giveaway:main:gwMessages:giveawayEnd")
                        .replaceAll('{emotes.giveaway}', bot.emotes.giveaway),
                    drawing: guild.translate("misc/giveaway:main:gwMessages:timeLeft")
                        .replaceAll('{emotes.info}', bot.emotes.star)
                        .replace('{condition}', gwCondition.text),
                    inviteToParticipate: guild.translate("misc/giveaway:main:gwMessages:participate")
                        .replace('{emotes.support}', bot.emotes.badges.earlysupporter)
                        .replace('{client}', bot.user.username)
                        .replace('{invite}', bot.invite)
                        .replace('{hostedBy}', gwHost.user.username),
                    winMessage: guild.translate("misc/giveaway:main:gwMessages:win")
                        .replaceAll('{emotes.giveaway}', bot.emotes.giveaway)
                        .replace('{emotes.arrow}', bot.emotes.arrow),
                    embedFooter: {
                        text: guild.translate("misc/giveaway:main:gwMessages:endAt"),
                    },
                    noWinner: guild.translate("misc/giveaway:main:gwMessages:noWinner")
                        .replaceAll('{emotes.info}', bot.emotes.star)
                        .replace('{emotes.support}', bot.emotes.badges.earlysupporter)
                        .replace('{client}', bot.user.username)
                        .replace('{invite}', bot.invite)
                        .replace('{condition}', gwCondition.text),
                    hostedBy: '',
                    winners: guild.translate("misc/giveaway:main:gwMessages:winners"),
                    endedAt: guild.translate("misc/giveaway:main:gwMessages:endedAt"),
                },
                extraData: {
                    requirement: {
                        raw: gwCondition.raw,
                        int: gwCondition.int,
                        text: gwCondition.text
                    }
                }
            });
        }

        let embed = new EmbedBuilder()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("language:collectors:action")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        let id = message?.member?.user?.id || interaction?.member?.user?.id
        let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('giveaway_' + id + '_start')
                    .setLabel(guild.translate("misc/giveaway:main:actions:1"))
                    .setEmoji('🎉')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('giveaway_' + id + '_reroll')
                    .setLabel(guild.translate("misc/giveaway:main:actions:2"))
                    .setEmoji('🔁')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('giveaway_' + id + '_stop')
                    .setLabel(guild.translate("misc/giveaway:main:actions:3"))
                    .setEmoji('➖')
                    .setDisabled(this.client.giveawaysManager.giveaways.filter(giveaway => giveaway.guildId === guild.id && giveaway.ended === false).length < 1)
                    .setStyle(ButtonStyle.Primary),
            )
        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('giveaway_' + id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({ filter }).catch(() => {})

        if(clicked){
            if (clicked.customId === 'giveaway_' + id + '_start') {

                let embed = new EmbedBuilder()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("misc/giveaway:main:start:collectors:channel")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                this.client.wait(1000).then(() => {
                    clicked.update({embeds: [embed], components: []});
                })
                const collectMessage = await channel.createMessageCollector({ filter: m => m.author.id === id });

                collectMessage.on("collect", async (msg) => {
                    collectMessage.stop();
                    msg.delete().catch(() => {});
                    let channelSent = await Resolver.resolveChannel({
                        message: msg,
                        search: msg.content,
                        channelType: 'GuildText',
                    });
                    if (channelSent) {
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("misc/giveaway:main:start:collectors:win")
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        this.client.wait(1000).then(() => {
                            sent.edit({embeds: [embed]});
                        })

                        const collectWin = await channel.createMessageCollector({ filter: m => m.author.id === id });
                        collectWin.on("collect", async (msg) => {
                            collectWin.stop();
                            msg.delete().catch(() => {});
                            let win = msg.content;
                            if(win){
                                let embed = new EmbedBuilder()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("misc/giveaway:main:start:collectors:duration")
                                        .replaceAll('{emotes.arrow}', this.client.emotes.arrow))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                this.client.wait(1000).then(() => {
                                    sent.edit({embeds: [embed]});
                                })
                                const collectDuration = await channel.createMessageCollector({ filter: m => m.author.id === id });
                                collectDuration.on("collect", async (msg) => {
                                    collectDuration.stop();
                                    msg.delete().catch(() => {});
                                    let duration = ms(msg.content);
                                    if(duration){
                                        let embed = new EmbedBuilder()
                                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                            .setDescription(guild.translate("misc/giveaway:main:start:collectors:winners")
                                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                                            .setColor(this.client.embedColor)
                                            .setFooter({text: data.guild.footer});
                                        this.client.wait(1000).then(() => {
                                            sent.edit({embeds: [embed]});
                                        })
                                        const collectWinners = await channel.createMessageCollector({ filter: m => m.author.id === id });
                                        collectWinners.on("collect", async (msg) => {
                                            collectWinners.stop();
                                            msg.delete().catch(() => {});
                                            let winnerCount = parseInt(msg.content);
                                            if(winnerCount && winnerCount > 0){
                                                let conditionRow = new ActionRowBuilder()
                                                    .addComponents(
                                                        new SelectMenuBuilder()
                                                            .setCustomId("condition_" + id)
                                                            .setPlaceholder(guild.translate("misc/giveaway:main:start:collectors:conditionMenu"))
                                                            .addOptions([
                                                                {
                                                                    label: guild.translate("misc/giveaway:main:start:conditions:1:label"),
                                                                    description: guild.translate("misc/giveaway:main:start:conditions:1:description"),
                                                                    value: '1_' + id
                                                                },
                                                                {
                                                                    label: guild.translate("misc/giveaway:main:start:conditions:2:label"),
                                                                    description: guild.translate("misc/giveaway:main:start:conditions:2:description"),
                                                                    value: '2_' + id
                                                                },
                                                                {
                                                                    label: guild.translate("misc/giveaway:main:start:conditions:3:label"),
                                                                    description: guild.translate("misc/giveaway:main:start:conditions:3:description")
                                                                        .replace('{client}', this.client.user.username),
                                                                    value: '3_' + id
                                                                },
                                                                {
                                                                    label: guild.translate("misc/giveaway:main:start:conditions:4:label"),
                                                                    description: guild.translate("misc/giveaway:main:start:conditions:4:description"),
                                                                    value: '4_' + id
                                                                },
                                                                {
                                                                    label: guild.translate("misc/giveaway:main:start:conditions:5:label"),
                                                                    description: guild.translate("misc/giveaway:main:start:conditions:5:description"),
                                                                    value: '5_' + id
                                                                },
                                                                {
                                                                    label: guild.translate("misc/giveaway:main:start:conditions:6:label"),
                                                                    description: guild.translate("misc/giveaway:main:start:conditions:6:description"),
                                                                    value: '6_' + id
                                                                },
                                                            ])
                                                    )
                                                let embed = new EmbedBuilder()
                                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                    .setDescription(guild.translate("misc/giveaway:main:start:collectors:condition")
                                                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                                                    .setColor(this.client.embedColor)
                                                    .setFooter({text: data.guild.footer});
                                                this.client.wait(1000).then(() => {
                                                    sent.edit({embeds: [embed], components: [conditionRow]});
                                                })
                                                const clicked = await sent.awaitMessageComponent({ filter:  m => m.user.id === member.user.id })
                                                    .catch(() => {
                                                        sent.edit({embeds: [embed], components: []});
                                                    })

                                                if(clicked){
                                                    if(clicked.componentType !== InteractionType.MessageComponent) return;
                                                    let condition = parseInt(clicked.values[0].split('_'));
                                                    let conditionInt = condition;
                                                    let conditionText = '';
                                                    if(condition){
                                                        if(condition === 1){
                                                            condition = "none";
                                                            conditionText = guild.translate("misc/giveaway:main:start:conditionTexts:" + conditionInt);
                                                            let conditionObj = {
                                                                text: conditionText,
                                                                raw: condition,
                                                                int: conditionInt
                                                            }
                                                            startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                            let embed = new EmbedBuilder()
                                                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                    .replace('{emotes.success}', this.client.emotes.success))
                                                                .setColor(this.client.embedColor)
                                                                .setFooter({text: data.guild.footer});
                                                            await clicked.update({embeds: [embed], components: []});
                                                        }
                                                        if(condition === 2){
                                                            condition = "none";
                                                            let embed = new EmbedBuilder()
                                                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                .setDescription(guild.translate("misc/giveaway:main:start:conditionDetailCollectors:2")
                                                                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                                                                .setColor(this.client.embedColor)
                                                                .setFooter({text: data.guild.footer});
                                                            await clicked.update({embeds: [embed], components: []});
                                                            const collectConditionRole = await channel.createMessageCollector({ filter: m => m.author.id === id });
                                                            collectConditionRole.on("collect", async (msg) => {
                                                                collectConditionRole.stop();
                                                                msg.delete().catch(() => {});
                                                                let role = await Resolver.resolveRole({
                                                                    message: msg,
                                                                    search: msg.content
                                                                });
                                                                if(role){
                                                                    condition = 'role_' + role.id;
                                                                    conditionText = guild.translate("misc/giveaway:main:start:conditionTexts:" + conditionInt)
                                                                        .replace('{role}', role)
                                                                    let conditionObj = {
                                                                        text: conditionText,
                                                                        raw: condition,
                                                                        int: conditionInt
                                                                    }
                                                                    startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                                    let embed = new EmbedBuilder()
                                                                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                        .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                            .replace('{emotes.success}', this.client.emotes.success))
                                                                        .setColor(this.client.embedColor)
                                                                        .setFooter({text: data.guild.footer});
                                                                    await sent.edit({embeds: [embed]});
                                                                }else{
                                                                    let conditionObj = {
                                                                        text: guild.translate("misc/giveaway:main:start:conditionTexts:1"),
                                                                        raw: 'none',
                                                                        int: 1
                                                                    }
                                                                    startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                                    let embed = new EmbedBuilder()
                                                                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                        .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                            .replace('{emotes.success}', this.client.emotes.success))
                                                                        .setColor(this.client.embedColor)
                                                                        .setFooter({text: data.guild.footer});
                                                                    await sent.edit({embeds: [embed]});
                                                                }
                                                            });
                                                        }
                                                        if(condition === 3){
                                                            condition = "none";
                                                            let embed = new EmbedBuilder()
                                                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                .setDescription(guild.translate("misc/giveaway:main:start:conditionDetailCollectors:3:1")
                                                                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                                                                    .replace('{client}', this.client.user.username))
                                                                .setColor(this.client.embedColor)
                                                                .setFooter({text: data.guild.footer});
                                                            let row = new ActionRowBuilder()
                                                                .addComponents(
                                                                    new ButtonBuilder()
                                                                        .setCustomId('choose_' + id + '_client')
                                                                        .setLabel(this.client.user.username)
                                                                        .setEmoji(this.client.emotes.logo.normal)
                                                                        .setStyle(ButtonStyle.Primary),
                                                                    new ButtonBuilder()
                                                                        .setCustomId('choose_' + id + '_mee6')
                                                                        .setLabel("MEE6")
                                                                        .setDisabled(true)
                                                                        .setEmoji(this.client.emotes.mee6)
                                                                        .setStyle(ButtonStyle.Primary),
                                                                    new ButtonBuilder()
                                                                        .setCustomId('choose_' + id + '_amari')
                                                                        .setLabel("Amari")
                                                                        .setDisabled(!guild.members.cache.find(m => m.user.username === 'AmariBot'))
                                                                        .setEmoji(this.client.emotes.amari)
                                                                        .setStyle(ButtonStyle.Primary),
                                                                )
                                                            await clicked.update({embeds: [embed], components: [row]});
                                                            const filter = i => i.customId.startsWith('choose_' + id) && i.user.id === id;

                                                            const clickedBot = await sent.awaitMessageComponent({ filter });

                                                            if(clickedBot){
                                                                let bot = clickedBot.customId.split('_')[2]
                                                                    .replace('client', this.client.user.username)
                                                                    .replace('amari', 'Amari')
                                                                    .replace('mee6', 'MEE6');
                                                                if(bot === this.client.user.username || bot === 'Amari' || bot === 'MEE6'){
                                                                    let embed = new EmbedBuilder()
                                                                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                        .setDescription(guild.translate("misc/giveaway:main:start:conditionDetailCollectors:3:2")
                                                                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                                                                        .setColor(this.client.embedColor)
                                                                        .setFooter({text: data.guild.footer});
                                                                    await clickedBot.update({embeds: [embed], components: []});
                                                                    const collectConditionLevel = await channel.createMessageCollector({ filter: m => m.author.id === id });
                                                                    collectConditionLevel.on("collect", async (msg) => {
                                                                        collectConditionLevel.stop();
                                                                        msg.delete().catch(() => {});
                                                                        if(parseInt(msg.content) && parseInt(msg.content) > 0){
                                                                            condition = 'level_' + msg.content + '_' + bot;
                                                                            conditionText = guild.translate("misc/giveaway:main:start:conditionTexts:" + conditionInt)
                                                                                .replace('{level}', msg.content)
                                                                                .replace('{bot}', bot)
                                                                            let conditionObj = {
                                                                                text: conditionText,
                                                                                raw: condition,
                                                                                int: conditionInt
                                                                            }
                                                                            startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                                            let embed = new EmbedBuilder()
                                                                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                                .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                                    .replace('{emotes.success}', this.client.emotes.success))
                                                                                .setColor(this.client.embedColor)
                                                                                .setFooter({text: data.guild.footer});
                                                                            await sent.edit({embeds: [embed]});
                                                                        }else{
                                                                            let conditionObj = {
                                                                                text: guild.translate("misc/giveaway:main:start:conditionTexts:1"),
                                                                                raw: 'none',
                                                                                int: 1
                                                                            }
                                                                            startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                                            let embed = new EmbedBuilder()
                                                                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                                .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                                    .replace('{emotes.success}', this.client.emotes.success))
                                                                                .setColor(this.client.embedColor)
                                                                                .setFooter({text: data.guild.footer});
                                                                            await sent.edit({embeds: [embed]});
                                                                        }
                                                                    });
                                                                }else{
                                                                    let conditionObj = {
                                                                        text: guild.translate("misc/giveaway:main:start:conditionTexts:1"),
                                                                        raw: 'none',
                                                                        int: 1
                                                                    }
                                                                    startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                                    let embed = new EmbedBuilder()
                                                                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                        .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                            .replace('{emotes.success}', this.client.emotes.success))
                                                                        .setColor(this.client.embedColor)
                                                                        .setFooter({text: data.guild.footer});
                                                                    await sent.edit({embeds: [embed]});
                                                                }
                                                            }
                                                        }
                                                        if(condition === 4) {
                                                            let embed = new EmbedBuilder()
                                                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                .setDescription(guild.translate("misc/giveaway:main:start:conditionDetailCollectors:4")
                                                                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                                                                .setColor(this.client.embedColor)
                                                                .setFooter({text: data.guild.footer});
                                                            await clicked.update({embeds: [embed], components: []});
                                                            const collectMinimumAge = await channel.createMessageCollector({ filter: m => m.author.id === id });
                                                            collectMinimumAge.on("collect", async (msg) => {
                                                                collectMinimumAge.stop();
                                                                msg.delete().catch(() => {});
                                                                if (parseInt(msg.content) && parseInt(msg.content) > 0) {
                                                                    condition = 'days_' + msg.content;
                                                                    conditionText = guild.translate("misc/giveaway:main:start:conditionTexts:" + conditionInt)
                                                                        .replace('{amount}', msg.content)
                                                                    let conditionObj = {
                                                                        text: conditionText,
                                                                        raw: condition,
                                                                        int: conditionInt
                                                                    }
                                                                    startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                                    let embed = new EmbedBuilder()
                                                                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                        .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                            .replace('{emotes.success}', this.client.emotes.success))
                                                                        .setColor(this.client.embedColor)
                                                                        .setFooter({text: data.guild.footer});
                                                                    await sent.edit({embeds: [embed]});
                                                                } else {
                                                                    let conditionObj = {
                                                                        text: guild.translate("misc/giveaway:main:start:conditionTexts:1"),
                                                                        raw: 'none',
                                                                        int: 1
                                                                    }
                                                                    startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                                    let embed = new EmbedBuilder()
                                                                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                        .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                            .replace('{emotes.success}', this.client.emotes.success))
                                                                        .setColor(this.client.embedColor)
                                                                        .setFooter({text: data.guild.footer});
                                                                    await sent.edit({embeds: [embed]});
                                                                }

                                                            });
                                                        }
                                                        if(condition === 5) {
                                                            let embed = new EmbedBuilder()
                                                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                .setDescription(guild.translate("misc/giveaway:main:start:conditionDetailCollectors:5")
                                                                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                                                                .setColor(this.client.embedColor)
                                                                .setFooter({text: data.guild.footer});
                                                            await clicked.update({embeds: [embed], components: []});
                                                            const collectInvite = await channel.createMessageCollector({ filter: m => m.author.id === id });
                                                            collectInvite.on("collect", async (msg) => {
                                                                collectInvite.stop();
                                                                msg.delete().catch(() => {});
                                                                function isUrl(str){
                                                                    let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
                                                                        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                                                                        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                                                                        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                                                                        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                                                                        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
                                                                    return !!pattern.test(str);
                                                                }
                                                                if(isUrl(msg.content)){
                                                                    let inviteCode = msg.content.split("/").pop();
                                                                    console.log(inviteCode)
                                                                    fetch('https://discord.com/api/invite/' + inviteCode)
                                                                        .then((res) => res.json())
                                                                        .then((json) => {
                                                                            if(json?.message && json?.message === "Unknown Invite"){
                                                                                let conditionObj = {
                                                                                    text: guild.translate("misc/giveaway:main:start:conditionTexts:1"),
                                                                                    raw: 'none',
                                                                                    int: 1
                                                                                }
                                                                                startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                                                let embed = new EmbedBuilder()
                                                                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                                    .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                                        .replace('{emotes.success}', this.client.emotes.success))
                                                                                    .setColor(this.client.embedColor)
                                                                                    .setFooter({text: data.guild.footer});
                                                                                return sent.edit({embeds: [embed]});
                                                                            }else{
                                                                                condition = 'invite_' + msg.content;
                                                                                conditionText = guild.translate("misc/giveaway:main:start:conditionTexts:" + conditionInt)
                                                                                    .replace('{invite}', msg.content)
                                                                                let conditionObj = {
                                                                                    text: conditionText,
                                                                                    raw: condition,
                                                                                    int: conditionInt
                                                                                }
                                                                                startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                                                let embed = new EmbedBuilder()
                                                                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                                    .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                                        .replace('{emotes.success}', this.client.emotes.success))
                                                                                    .setColor(this.client.embedColor)
                                                                                    .setFooter({text: data.guild.footer});
                                                                                return sent.edit({embeds: [embed]});
                                                                            }
                                                                        })

                                                                }else{
                                                                    let conditionObj = {
                                                                        text: guild.translate("misc/giveaway:main:start:conditionTexts:1"),
                                                                        raw: 'none',
                                                                        int: 1
                                                                    }
                                                                    startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                                    let embed = new EmbedBuilder()
                                                                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                        .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                            .replace('{emotes.success}', this.client.emotes.success))
                                                                        .setColor(this.client.embedColor)
                                                                        .setFooter({text: data.guild.footer});
                                                                    return sent.edit({embeds: [embed]});
                                                                }
                                                            })

                                                        }
                                                        if(condition === 6) {
                                                            let embed = new EmbedBuilder()
                                                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                .setDescription(guild.translate("misc/giveaway:main:start:conditionDetailCollectors:6")
                                                                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                                                                .setColor(this.client.embedColor)
                                                                .setFooter({text: data.guild.footer});
                                                            await clicked.update({embeds: [embed], components: []});
                                                            const collectCondition = await channel.createMessageCollector({ filter: m => m.author.id === id });
                                                            collectCondition.on("collect", async (msg) => {
                                                                collectCondition.stop();
                                                                msg.delete().catch(() => {});
                                                                if(msg.content){
                                                                    condition = 'custom_' + msg.content;
                                                                    conditionText = guild.translate("misc/giveaway:main:start:conditionTexts:" + conditionInt)
                                                                        .replace('{text}', msg.content)
                                                                    let conditionObj = {
                                                                        text: conditionText,
                                                                        raw: condition,
                                                                        int: conditionInt
                                                                    }
                                                                    startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                                    let embed = new EmbedBuilder()
                                                                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                        .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                            .replace('{emotes.success}', this.client.emotes.success))
                                                                        .setColor(this.client.embedColor)
                                                                        .setFooter({text: data.guild.footer});
                                                                    return sent.edit({embeds: [embed]});
                                                                }else{
                                                                    let conditionObj = {
                                                                        text: guild.translate("misc/giveaway:main:start:conditionTexts:1"),
                                                                        raw: 'none',
                                                                        int: 1
                                                                    }
                                                                    startGw(this.client, channelSent, duration, win, member, winnerCount, conditionObj)
                                                                    let embed = new EmbedBuilder()
                                                                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                                        .setDescription(guild.translate("misc/giveaway:main:start:created")
                                                                            .replace('{emotes.success}', this.client.emotes.success))
                                                                        .setColor(this.client.embedColor)
                                                                        .setFooter({text: data.guild.footer});
                                                                    return sent.edit({embeds: [embed]});
                                                                }
                                                            });
                                                        }
                                                    }else{
                                                        let embed = new EmbedBuilder()
                                                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                            .setDescription(guild.translate("misc/giveaway:main:start:invalid")
                                                                .replace('{emotes.error}', this.client.emotes.error))
                                                            .setColor(this.client.embedColor)
                                                            .setFooter({text: data.guild.footer});
                                                        return clicked.update({embeds: [embed], components: []});
                                                    }
                                                }
                                            }else{
                                                let embed = new EmbedBuilder()
                                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                                    .setDescription(guild.translate("misc/giveaway:main:start:invalid")
                                                        .replace('{emotes.error}', this.client.emotes.error))
                                                    .setColor(this.client.embedColor)
                                                    .setFooter({text: data.guild.footer});
                                                return sent.edit({embeds: [embed]});
                                            }
                                        });
                                    }else{
                                        let embed = new EmbedBuilder()
                                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                            .setDescription(guild.translate("misc/giveaway:main:start:invalid")
                                                .replace('{emotes.error}', this.client.emotes.error))
                                            .setColor(this.client.embedColor)
                                            .setFooter({text: data.guild.footer});
                                        return sent.edit({embeds: [embed]});
                                    }
                                });
                            }else{
                                let embed = new EmbedBuilder()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("misc/giveaway:main:start:invalid")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                return sent.edit({embeds: [embed]});
                            }
                        });
                    } else {
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("misc/giveaway:main:start:invalid")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        return sent.edit({embeds: [embed]});
                    }
                });
            }
            if (clicked.customId === 'giveaway_' + id + '_reroll') {

                let embed = new EmbedBuilder()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("misc/giveaway:main:reroll:collector")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                clicked.update({embeds: [embed], components: []});
                const collectMessage = await channel.createMessageCollector({ filter: m => m.author.id === id });

                collectMessage.on("collect", async (msg) => {
                    collectMessage.stop();
                    msg.delete().catch(() => {});
                    let gwId = msg.content;
                    if(gwId) {
                        this.client.giveawaysManager.reroll(gwId, {
                            messages: {
                                error: guild.translate("misc/giveaway:main:reroll:noWinner")
                                    .replace('{emotes.error}', this.client.emotes.error),
                                congrat: guild.translate("misc/giveaway:main:gwMessages:win")
                                    .replaceAll('{emotes.giveaway}', this.client.emotes.giveaway)
                                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                            }
                        })
                            .then(() => {
                                let embed = new EmbedBuilder()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("misc/giveaway:main:reroll:success")
                                        .replace('{emotes.success}', this.client.emotes.success))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                return sent.edit({embeds: [embed]});
                            })
                            .catch((err) => {
                                let embed = new EmbedBuilder()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("misc/giveaway:main:reroll:error")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                return sent.edit({embeds: [embed]});
                            })
                    }else{
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("misc/giveaway:main:reroll:error")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        return sent.edit({embeds: [embed]});
                    }
                });
            }
            if (clicked.customId === 'giveaway_' + id + '_stop') {
                let embed = new EmbedBuilder()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("misc/giveaway:main:end:collector")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                clicked.update({embeds: [embed], components: []});
                const collectMessage = await channel.createMessageCollector({ filter: m => m.author.id === id });

                collectMessage.on("collect", async (msg) => {
                    collectMessage.stop();
                    msg.delete().catch(() => {});
                    let gwId = msg.content;
                    if(gwId) {
                        this.client.giveawaysManager.end(gwId)
                            .then(() => {
                                let embed = new EmbedBuilder()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("misc/giveaway:main:end:success")
                                        .replace('{emotes.success}', this.client.emotes.success))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                return sent.edit({embeds: [embed]});
                            })
                            .catch((err) => {
                                console.log(err);
                                let embed = new EmbedBuilder()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("misc/giveaway:main:end:error")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                return sent.edit({embeds: [embed]});
                            })
                    }else{
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("misc/giveaway:main:end:error")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        return sent.edit({embeds: [embed]});
                    }
                });
            }
        }
    };
}
module.exports = Giveaway;
