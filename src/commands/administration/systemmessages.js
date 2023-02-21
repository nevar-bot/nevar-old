const Command = require('../../structures/BaseCommand');
const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { SlashCommandBuilder } = require("discord.js");

const Resolver ="test";

class Systemmessages extends Command {

    constructor(client) {
        super(client, {
            name: "systemmessages",
            description: "administration/systemmessages:general:description",
            memberPermissions: ["ManageGuild"],
            cooldown: 3000,
            dirname: __dirname,
            slashCommand: {
                addCommand: false,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option =>
                            option
                                .setRequired(true)
                                .addChoices(
                                    { name: '1', value: '3' },
                                    { name: '2', value: '4' }
                                )
                        )
            }
        });
    }

    async run(interaction, args, data) {
        const { guild, member, channel, user } = interaction;
        const id = user.id;


        if (args[0].toLowerCase() === "goodbye") {
            let embed = new EmbedBuilder()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("language:collectors:action")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter({text: this.client.footer});
            let row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('systemmessages_' + id + '_edit')
                        .setLabel(guild.translate("administration/systemmessages:main:buttonLabels:1"))
                        .setEmoji(this.client.emotes.edit)
                        .setDisabled(data.guild.plugins.goodbye.enabled === false)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('systemmessages_' + id + '_test')
                        .setLabel(guild.translate("administration/systemmessages:main:buttonLabels:2"))
                        .setEmoji(this.client.emotes.arrow)
                        .setDisabled(data.guild.plugins.goodbye.enabled === false)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('systemmessages_' + id + '_enable')
                        .setLabel(guild.translate("administration/systemmessages:main:buttonLabels:3"))
                        .setEmoji(this.client.emotes.enable)
                        .setDisabled(data.guild.plugins.goodbye.enabled === true)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('systemmessages_' + id + '_disable')
                        .setLabel(guild.translate("administration/systemmessages:main:buttonLabels:4"))
                        .setEmoji(this.client.emotes.disable)
                        .setDisabled(data.guild.plugins.goodbye.enabled === false)
                        .setStyle(ButtonStyle.Secondary),
                )
            let sent = await interaction.send(embed, false, [row]);

            const filter = i => i.customId.startsWith('systemmessages_' + id) && i.user.id === id;

            const clicked = await sent.awaitMessageComponent({ filter }).catch(() => {})

            if (clicked) {
                if (clicked.customId === 'systemmessages_' + id + '_edit') {
                    let key = this.client.randomKey(10);

                    const goodbyeModal = new ModalBuilder()
                        .setCustomId(id + '_goodbye_modal' + '_' + key)
                        .setTitle(guild.translate("administration/systemmessages:main:goodbye:modal:title"));

                    const channelInput = new TextInputBuilder()
                        .setCustomId('channel')
                        .setLabel(guild.translate("language:collectors:channel"))
                        .setValue(data.guild.plugins.goodbye.channel ? data.guild.plugins.goodbye.channel.toString() : '')
                        .setStyle(TextInputStyle.Short);

                    const messageInput = new TextInputBuilder()
                        .setCustomId('message')
                        .setLabel(guild.translate("administration/systemmessages:main:goodbye:modal:labels:message"))
                        .setPlaceholder(guild.translate("administration/systemmessages:main:goodbye:modal:placeholders:message"))
                        .setValue(data.guild.plugins.goodbye.message ? data.guild.plugins.goodbye.message : '')
                        .setStyle(TextInputStyle.Paragraph);

                    let firstModalRow = new ActionRowBuilder().addComponents(channelInput);
                    let secondModalRow = new ActionRowBuilder().addComponents(messageInput);

                    goodbyeModal.addComponents(firstModalRow, secondModalRow);

                    await clicked.showModal(goodbyeModal);

                    const submitted = await clicked.awaitModalSubmit({
                        time: 600000,
                        filter: i => i.user.id = user.id
                    }).catch(() => {});

                    if (submitted) {
                        if(submitted.customId !== id + '_goodbye_modal' + '_' + key) return;

                        let channel = submitted.fields.getTextInputValue('channel');
                        let message = submitted.fields.getTextInputValue('message');

                        let channelInput = await Resolver.channelResolver(channel, guild, "GuildText");
                        if(channelInput){
                            data.guild.plugins.goodbye.message = message;
                            data.guild.plugins.goodbye.channel = channelInput.id;
                            data.guild.markModified("plugins.goodbye");
                            await data.guild.save();
                            let embed = new EmbedBuilder()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("administration/systemmessages:main:goodbye:success")
                                    .replace('{emotes.success}', this.client.emotes.success))
                                .setColor(this.client.embedColor)
                                .setFooter({text: this.client.footer});
                            return submitted.update({embeds: [embed], components: []});
                        }else{
                            let embed = new EmbedBuilder()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("language:invalid:channel")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter({text: this.client.footer});
                            return submitted.update({embeds: [embed], components: []});
                        }
                    }
                }
                if (clicked.customId === 'systemmessages_' + id + '_test') {
                    this.client.emit("guildMemberRemove", member);
                    let embed = new EmbedBuilder()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:executed")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: this.client.footer});
                    return clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'systemmessages_' + id + '_enable') {
                    data.guild.plugins.goodbye.enabled = true;
                    data.guild.markModified("plugins.goodbye");
                    await data.guild.save();
                    let embed = new EmbedBuilder()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:goodbye:enabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: this.client.footer});
                    return clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'systemmessages_' + id + '_disable') {
                    data.guild.plugins.goodbye.enabled = false;
                    data.guild.markModified("plugins.goodbye");
                    await data.guild.save();
                    let embed = new EmbedBuilder()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:goodbye:disabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: this.client.footer});
                    return clicked.update({embeds: [embed], components: []});
                }
            }
        }
        if (args[0].toLowerCase() === "welcome") {
            let embed = new EmbedBuilder()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("language:collectors:action")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter({text: this.client.footer});
            let row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('systemmessages_' + id + '_edit')
                        .setLabel(guild.translate("administration/systemmessages:main:buttonLabels:1"))
                        .setEmoji(this.client.emotes.edit)
                        .setDisabled(data.guild.plugins.welcome.enabled === false)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('systemmessages_' + id + '_test')
                        .setLabel(guild.translate("administration/systemmessages:main:buttonLabels:2"))
                        .setEmoji(this.client.emotes.arrow)
                        .setDisabled(data.guild.plugins.welcome.enabled === false)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('systemmessages_' + id + '_enable')
                        .setLabel(guild.translate("administration/systemmessages:main:buttonLabels:3"))
                        .setEmoji(this.client.emotes.enable)
                        .setDisabled(data.guild.plugins.welcome.enabled === true)
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('systemmessages_' + id + '_disable')
                        .setLabel(guild.translate("administration/systemmessages:main:buttonLabels:4"))
                        .setEmoji(this.client.emotes.disable)
                        .setDisabled(data.guild.plugins.welcome.enabled === false)
                        .setStyle(ButtonStyle.Secondary),
                )
            let sent  = await interaction.send(embed, false, [row]);

            const filter = i => i.customId.startsWith('systemmessages_' + id) && i.user.id === id;

            const clicked = await sent.awaitMessageComponent({ filter }).catch(() => {
            })

            if (clicked) {
                if (clicked.customId === 'systemmessages_' + id + '_edit') {
                    let key = this.client.randomKey(10);

                    const welcomeModal = new ModalBuilder()
                        .setCustomId(id + '_welcome_modal' + '_' + key)
                        .setTitle(guild.translate("administration/systemmessages:main:welcome:modal:title"));

                    const channelInput = new TextInputBuilder()
                        .setCustomId('channel')
                        .setLabel(guild.translate("language:collectors:channel"))
                        .setValue(data.guild.plugins.welcome.channel ? data.guild.plugins.welcome.channel.toString() : '')
                        .setStyle(TextInputStyle.Short);

                    const messageInput = new TextInputBuilder()
                        .setCustomId('message')
                        .setLabel(guild.translate("administration/systemmessages:main:welcome:modal:labels:message"))
                        .setPlaceholder(guild.translate("administration/systemmessages:main:welcome:modal:placeholders:message"))
                        .setValue(data.guild.plugins.welcome.message ? data.guild.plugins.welcome.message : '')
                        .setStyle(TextInputStyle.Paragraph);

                    let firstModalRow = new ActionRowBuilder().addComponents(channelInput);
                    let secondModalRow = new ActionRowBuilder().addComponents(messageInput);

                    welcomeModal.addComponents(firstModalRow, secondModalRow);

                    await clicked.showModal(welcomeModal);

                    const submitted = await clicked.awaitModalSubmit({
                        time: 600000,
                        filter: i => i.user.id = user.id
                    }).catch(() => {});

                    if (submitted) {
                        if(submitted.customId !== id + '_welcome_modal' + '_' + key) return;

                        let channel = submitted.fields.getTextInputValue('channel');
                        let message = submitted.fields.getTextInputValue('message');

                        let channelInput = await Resolver.channelResolver(channel, guild, "GuildText");
                        if(channelInput){
                            data.guild.plugins.welcome.message = message;
                            data.guild.plugins.welcome.channel = channelInput.id;
                            data.guild.markModified("plugins.welcome");
                            await data.guild.save();
                            let embed = new EmbedBuilder()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("administration/systemmessages:main:welcome:success")
                                    .replace('{emotes.success}', this.client.emotes.success))
                                .setColor(this.client.embedColor)
                                .setFooter({text: this.client.footer});
                            return submitted.update({embeds: [embed], components: []});
                        }else{
                            let embed = new EmbedBuilder()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("language:invalid:channel")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter({text: this.client.footer});
                            return submitted.update({embeds: [embed], components: []});
                        }
                    }
                }
                if (clicked.customId === 'systemmessages_' + id + '_test') {
                    this.client.emit("guildMemberAdd", member);
                    let embed = new EmbedBuilder()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:executed")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: this.client.footer});
                    return clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'systemmessages_' + id + '_enable') {
                    data.guild.plugins.welcome.enabled = true;
                    data.guild.markModified("plugins.welcome");
                    await data.guild.save();
                    let embed = new EmbedBuilder()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:welcome:enabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: this.client.footer});
                    return clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'systemmessages_' + id + '_disable') {
                    data.guild.plugins.welcome.enabled = false;
                    data.guild.markModified("plugins.welcome");
                    await data.guild.save();
                    let embed = new EmbedBuilder()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:welcome:disabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: this.client.footer});
                    return clicked.update({embeds: [embed], components: []});
                }
            }
        }
    };
}

module.exports = Systemmessages;
