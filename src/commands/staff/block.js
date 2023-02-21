const Command = require('../../structures/BaseCommand');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const moment = require("moment");
const fs = require('fs');

class Block extends Command {
    constructor(client){
        super(client, {
            name: "block",
            description: "staff/block:general:description",
            cooldown: 3000,
            staffOnly: true,
            dirname: __dirname,
            slashCommand: {
                addCommand: false,
                data: new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, args, data){
        const { guild, member, channel, user } = interaction;
        const id = user.id;

        let embed = new EmbedBuilder()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("language:collectors:action")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter({text: this.client.footer});
        let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('block_' + id + '_block')
                    .setLabel(guild.translate("staff/block:main:actions:1"))
                    .setEmoji(this.client.emotes.plus)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('block_' + id + '_list')
                    .setLabel(guild.translate("staff/block:main:actions:2"))
                    .setDisabled((await this.client.usersData.find({'blocked.state':true})).length === 0 && (await this.client.guildsData.find({'blocked.state':true})).length === 0)
                    .setEmoji(this.client.emotes.list)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('block_' + id + '_unblock')
                    .setLabel(guild.translate("staff/block:main:actions:3"))
                    .setDisabled((await this.client.usersData.find({'blocked.state':true})).length === 0 && (await this.client.guildsData.find({'blocked.state':true})).length === 0)
                    .setEmoji(this.client.emotes.minus)
                    .setStyle(ButtonStyle.Secondary),
            )
        let sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('block_' + id) && i.user.id === id;
        const clicked = await sent.awaitMessageComponent({ filter }).catch(() => {})

        if (clicked) {
            if (clicked.customId === 'block_' + id + '_block') {
                let key = this.client.randomKey(10);
                const blockModal = new ModalBuilder()
                    .setCustomId(id + '_block_modal' + '_' + key)
                    .setTitle(guild.translate("staff/block:main:modal:title"));

                const idInput = new TextInputBuilder()
                    .setCustomId('id')
                    .setLabel(guild.translate("language:collectors:id"))
                    .setStyle(TextInputStyle.Short);

                const reasonInput = new TextInputBuilder()
                    .setCustomId('reason')
                    .setLabel(guild.translate("staff/block:main:modal:labels:reason"))
                    .setStyle(TextInputStyle.Paragraph);


                let firstModalRow = new ActionRowBuilder().addComponents(idInput);
                let secondModalRow = new ActionRowBuilder().addComponents(reasonInput);
                blockModal.addComponents(firstModalRow, secondModalRow);
                await clicked.showModal(blockModal);
                const submitted = await clicked.awaitModalSubmit({
                    time: 600000,
                    filter: i => i.user.id = user.id
                }).catch(() => {});

                if (submitted) {
                    if (submitted.customId !== id + '_block_modal' + '_' + key) return;

                    let idInput = submitted.fields.getTextInputValue('id');
                    let reasonInput = submitted.fields.getTextInputValue('reason');

                    let blockObject = this.client.guilds.cache.get(idInput) || await this.client.users.fetch(idInput).catch(() => {});
                    let objectType = blockObject?.constructor.name.toString();

                    let staffs = JSON.parse(fs.readFileSync("./storage/staffs.json"));
                    if(this.client.config.general.ownerId === blockObject.id || staffs[blockObject.id] === 'head_staff' || blockObject.id === this.client.config.support.id) {
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:cancelled")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: this.client.footer});
                        return submitted.update({embeds: [embed], components: []});
                    }
                    if(blockObject){
                        if(objectType === 'Guild'){
                            let guildData = await this.client.findOrCreateGuild({
                                id: blockObject.id
                            });
                            guildData.blocked = {
                                state: true,
                                name: blockObject.name,
                                reason: reasonInput,
                                since: Date.now(),
                                moderator: user.tag
                            }
                            guildData.markModified("blocked");
                            await guildData.save();
                        }else if(objectType === 'User'){
                            let userData = await this.client.findOrCreateUser({
                                id: blockObject.id
                            });
                            userData.blocked = {
                                state: true,
                                name: blockObject.tag,
                                reason: reasonInput,
                                since: Date.now(),
                                moderator: user.tag
                            }
                            userData.markModified("blocked");
                            await userData.save();
                        }
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("staff/block:main:blocked")
                                .replace('{name}', objectType === 'Guild' ? blockObject.name : blockObject.tag)
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter({text: this.client.footer});
                        return submitted.update({embeds:[embed], components: []});
                    }else{
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:invalid:id")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: this.client.footer});
                        return submitted.update({embeds:[embed], components: []});
                    }
                }
            }
            if (clicked.customId === 'block_' + id + '_list') {
                let blocked = [];
                await this.client.usersData.find({ 'blocked.state': true }).then((users) => {
                    users.forEach((user) => {
                        blocked.push({
                            name: user.blocked.name,
                            id: user.id,
                            reason: user.blocked.reason,
                            since: moment.tz(new Date(user.blocked.since), guild.translate("language:timezone")).format(guild.translate("language:dateformat")),
                            moderator: user.blocked.moderator
                        });
                    });
                });
                await this.client.guildsData.find({ 'blocked.state': true }).then((guilds) => {
                    guilds.forEach((guildData) => {
                        blocked.push({
                            name: guildData.blocked.name,
                            id: guildData.id,
                            reason: guildData.blocked.reason,
                            since: moment.tz(new Date(guildData.blocked.since), guild.translate("language:timezone")).format(guild.translate("language:dateformat")),
                            moderator: guildData.blocked.moderator
                        })
                    })
                });

                let backId = member.user.id + '_back';
                let forwardId = member.user.id + '_forward';

                let backButton = new ButtonBuilder({
                    style: ButtonStyle.Secondary,
                    label: guild.translate("language:labels:back"),
                    emoji: this.client.emotes.arrow_left,
                    custom_id: backId
                });

                let forwardButton = new ButtonBuilder({
                    style: ButtonStyle.Secondary,
                    label: guild.translate("language:labels:forward"),
                    emoji: this.client.emotes.arrow_right,
                    custom_id: forwardId
                });

                blocked = [...blocked];

                let generateEmbed = async start => {
                    const current = blocked.slice(start, start + 5);
                    let text = '{text}'
                        .replace('{text}',
                            current.map(blockedObj => (
                                '\n\n**'+ this.client.emotes.arrow + ' ' + blockedObj.name + '**\n' + '» ' + guild.translate("staff/block:main:list:id") + blockedObj.id + '\n' + '» ' + guild.translate("staff/block:main:list:moderator") + blockedObj.moderator +'\n' + '» ' + guild.translate("staff/block:main:list:reason") + blockedObj.reason + '\n' + '» ' + guild.translate("staff/block:main:list:since") + blockedObj.since
                            )).join(''));

                    let pagesTotal = Math.ceil(blocked.length / 5);
                    if (pagesTotal === 0) pagesTotal = 1;
                    let currentPage = Math.round(start / 5) + 1;


                    if(blocked.length === 0){
                        text = guild.translate("language:noEntries");
                    }
                    return new EmbedBuilder()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setTitle(guild.translate("staff/block:main:showing")
                            .replace('{page}', currentPage)
                            .replace('{pages}', pagesTotal))
                        .setDescription(text)
                        .setThumbnail(this.client.user.displayAvatarURL())
                        .setColor(this.client.embedColor)
                        .setFooter({text: this.client.footer});
                }

                const canFitOnePage = blocked.length <= 5;
                const embedMessage = await clicked.update({
                    embeds : [await generateEmbed(0)],
                    components: canFitOnePage
                        ? []
                        : [new ActionRowBuilder({components: [forwardButton]})],
                    fetchReply: true
                });
                if(canFitOnePage) return;

                const collector = embedMessage.createMessageComponentCollector({
                    filter: ({user}) => user.id === member.user.id
                });

                let currentIndex = 0;

                collector.on('collect', async (interaction) => {
                    interaction.customId === backId ? (currentIndex -= 5) : (currentIndex += 5);

                    await interaction.update({
                        embeds: [await generateEmbed(currentIndex)],
                        components: [
                            new ActionRowBuilder({
                                components: [
                                    ...(currentIndex ? [backButton] : []),
                                    ...(currentIndex + 5 < blocked.length ? [forwardButton] : [])
                                ]
                            })
                        ]
                    })
                })
            }
            if (clicked.customId === 'block_' + id + '_unblock') {
                let key = this.client.randomKey(10);
                const blockModal = new ModalBuilder()
                    .setCustomId(id + '_block_modal' + '_' + key)
                    .setTitle(guild.translate("staff/block:main:unblockModal:title"));

                const idInput = new TextInputBuilder()
                    .setCustomId('id')
                    .setLabel(guild.translate("language:collectors:id"))
                    .setStyle(TextInputStyle.Short);


                let firstModalRow = new ActionRowBuilder().addComponents(idInput);
                blockModal.addComponents(firstModalRow);
                await clicked.showModal(blockModal);
                const submitted = await clicked.awaitModalSubmit({
                    time: 600000,
                    filter: i => i.user.id = user.id
                }).catch(() => {});

                if (submitted) {
                    if (submitted.customId !== id + '_block_modal' + '_' + key) return;

                    let idInput = submitted.fields.getTextInputValue('id');

                    let unblockObject = (await this.client.usersData.find({ 'id': idInput}))[0] || (await this.client.guildsData.find({ 'id': idInput}))[0]

                    if(unblockObject){
                        let guildState;
                        await this.client.users.fetch(idInput)
                            .then(() => guildState = false)
                            .catch(() => guildState = true);

                        let mongooseData;
                        if(guildState){
                            mongooseData = await this.client.findOrCreateGuild({id: idInput});
                        }else{
                            mongooseData = await this.client.findOrCreateUser({id: idInput});
                        }

                        let name = mongooseData.blocked.name;

                        mongooseData.blocked = {
                            state: false,
                            name: null,
                            reason: null,
                            since: null
                        }
                        mongooseData.markModified("blocked");
                        await mongooseData.save();
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("staff/block:main:unblocked")
                                .replace('{name}', name)
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter({text: this.client.footer});
                        return submitted.update({embeds:[embed], components: []});
                    }else{
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:invalid:id")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: this.client.footer});
                        return submitted.update({embeds:[embed], components: []});
                    }
                }
            }
        }
    }
}

module.exports = Block
