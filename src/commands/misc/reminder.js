const Command = require('../../structures/BaseCommand');
const { ButtonBuilder, ActionRowBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const reminderManager = require('../../helpers/reminders/Manager');
const ms = require('ms');
const moment = require("moment");

class Reminder extends Command {

    constructor(client) {
        super(client, {
            name: "reminder",
            description: "misc/reminder:general:description",
            cooldown: 3000,
            dirname: __dirname,
            slashCommand: {
                addCommand: false,
                data:
                    new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, args, data) {
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
                    .setCustomId('reminder_' + id + '_create')
                    .setLabel(guild.translate("misc/reminder:main:buttonLabels:1"))
                    .setEmoji(this.client.emotes.plus)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('reminder_' + id + '_list')
                    .setLabel(guild.translate("misc/reminder:main:buttonLabels:2"))
                    .setEmoji(this.client.emotes.list)
                    .setDisabled((await reminderManager.getReminders(data.memberData)).length < 1)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('reminder_' + id + '_delete')
                    .setLabel(guild.translate("misc/reminder:main:buttonLabels:3"))
                    .setEmoji(this.client.emotes.minus)
                    .setDisabled((await reminderManager.getReminders(data.memberData)).length < 1)
                    .setStyle(ButtonStyle.Secondary)
            )
        let sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('reminder_' + id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({ filter }).catch(() => {})

        if (clicked) {
            if (clicked.customId === 'reminder_' + id + '_create') {

                let key = this.client.randomKey(10);
                const reminderModal = new ModalBuilder()
                    .setCustomId(id + '_reminder_modal' + '_' + key)
                    .setTitle(guild.translate("misc/reminder:main:modal:title"));

                const reasonInput = new TextInputBuilder()
                    .setCustomId('reason')
                    .setLabel(guild.translate("misc/reminder:main:collectors:reason"))
                    .setStyle(TextInputStyle.Paragraph);

                const timeInput = new TextInputBuilder()
                    .setCustomId('time')
                    .setLabel(guild.translate("language:collectors:time"))
                    .setStyle(TextInputStyle.Short);

                let firstModalRow = new ActionRowBuilder().addComponents(reasonInput);
                let secondModalRow = new ActionRowBuilder().addComponents(timeInput);

                reminderModal.addComponents(firstModalRow, secondModalRow);

                await clicked.showModal(reminderModal);

                const submitted = await clicked.awaitModalSubmit({
                    time: 600000,
                    filter: i => i.user.id = user.id
                }).catch(() => {});

                if (submitted) {
                    if (submitted.customId !== id + '_reminder_modal' + '_' + key) return;

                    let reason = submitted.fields.getTextInputValue('reason');
                    let time = submitted.fields.getTextInputValue('time');

                    let timeInput = ms(time);
                    if(timeInput){
                        let reminderObj = {
                            channel: channel.id,
                            reason: reason,
                            startDate: Date.now(),
                            endDate: Date.now() + timeInput
                        }
                        let reminder = await reminderManager.createReminder(data.memberData, reminderObj)
                        if(reminder.success){
                            let reminderDiff = moment.duration(moment(Date.now()).diff(Date.now() + timeInput))._data;
                            let reminderRelative = [];
                            if(reminderDiff.years < 0)
                                reminderRelative.push(Math.abs(reminderDiff.years) + ' ' + (Math.abs(reminderDiff.years) > 1 ? guild.translate("timeUnits:years") : guild.translate("timeUnits:year")));
                            if(reminderDiff.months < 0)
                                reminderRelative.push(Math.abs(reminderDiff.months) + ' ' + (Math.abs(reminderDiff.months) > 1 ? guild.translate("timeUnits:months") : guild.translate("timeUnits:month")));
                            if(reminderDiff.days < 0)
                                reminderRelative.push(Math.abs(reminderDiff.days) + ' ' + (Math.abs(reminderDiff.days) > 1 ? guild.translate("timeUnits:days") : guild.translate("timeUnits:day")));
                            if(reminderDiff.hours < 0)
                                reminderRelative.push(Math.abs(reminderDiff.hours) + ' ' + (Math.abs(reminderDiff.hours) > 1 ? guild.translate("timeUnits:hours") : guild.translate("timeUnits:hour")));
                            if(reminderDiff.minutes < 0)
                                reminderRelative.push(Math.abs(reminderDiff.minutes) + ' ' + (Math.abs(reminderDiff.minutes) > 1 ? guild.translate("timeUnits:minutes") : guild.translate("timeUnits:minute")));
                            if(reminderDiff.seconds < 0)
                                reminderRelative.push(Math.abs(reminderDiff.seconds) + ' ' + (Math.abs(reminderDiff.seconds) > 1 ? guild.translate("timeUnits:seconds") : guild.translate("timeUnits:second")));

                            reminderRelative = reminderRelative.join(', ');
                            this.client.databaseCache.reminders.set(member.user.id + guild.id, data.memberData);
                            let embed = new EmbedBuilder()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("misc/reminder:main:created")
                                    .replace('{relative}', reminderRelative)
                                    .replace('{reason}', reason)
                                    .replace('{emotes.success}', this.client.emotes.success))
                                .setColor(this.client.embedColor)
                                .setFooter({text: this.client.footer});
                            return submitted.update({embeds: [embed], components: []});
                        }else{
                            let embed = new EmbedBuilder()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("language:error")
                                    .replace('{emotes.error}', this.client.emotes.error)
                                    .replace('{support}', this.client.supportUrl))
                                .setColor(this.client.embedColor)
                                .setFooter({text: this.client.footer});
                            return submitted.update({embeds: [embed], components: []});
                        }
                    }else{
                        let embed = new EmbedBuilder()
                            .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website })
                            .setDescription(guild.translate("language:invalid:time")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({ text: this.client.footer });
                        return submitted.update({ embeds: [embed], components: [] });
                    }
                }else{
                    let embed = new EmbedBuilder()
                        .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website })
                        .setDescription(guild.translate("language:timeEnded")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter({ text: this.client.footer });
                    return submitted.update({ embeds: [embed], components: [] });
                }
            }
            if (clicked.customId === 'reminder_' + id + '_list') {
                let remindersArray = await reminderManager.getReminders(data.memberData);

                let reminders = [...remindersArray];

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

                function negativeTimeRelative(timestamp){
                    let reminderDiff = moment.duration(moment(Date.now()).diff(timestamp))._data;
                    let reminderRelative = [];
                    if(reminderDiff.years < 0)
                        reminderRelative.push(Math.abs(reminderDiff.years) + ' ' + (Math.abs(reminderDiff.years) > 1 ? guild.translate("timeUnits:years") : guild.translate("timeUnits:year")));
                    if(reminderDiff.months < 0)
                        reminderRelative.push(Math.abs(reminderDiff.months) + ' ' + (Math.abs(reminderDiff.months) > 1 ? guild.translate("timeUnits:months") : guild.translate("timeUnits:month")));
                    if(reminderDiff.days < 0)
                        reminderRelative.push(Math.abs(reminderDiff.days) + ' ' + (Math.abs(reminderDiff.days) > 1 ? guild.translate("timeUnits:days") : guild.translate("timeUnits:day")));
                    if(reminderDiff.hours < 0)
                        reminderRelative.push(Math.abs(reminderDiff.hours) + ' ' + (Math.abs(reminderDiff.hours) > 1 ? guild.translate("timeUnits:hours") : guild.translate("timeUnits:hour")));
                    if(reminderDiff.minutes < 0)
                        reminderRelative.push(Math.abs(reminderDiff.minutes) + ' ' + (Math.abs(reminderDiff.minutes) > 1 ? guild.translate("timeUnits:minutes") : guild.translate("timeUnits:minute")));
                    if(reminderDiff.seconds < 0)
                        reminderRelative.push(Math.abs(reminderDiff.seconds) + ' ' + (Math.abs(reminderDiff.seconds) > 1 ? guild.translate("timeUnits:seconds") : guild.translate("timeUnits:second")));

                    return reminderRelative.join(', ');
                }

                function positiveTimeRelative(timestamp){
                    let reminderDiff = moment.duration(moment(Date.now()).diff(timestamp))._data;
                    let reminderAgo = [];
                    if(reminderDiff.years > 0)
                        reminderAgo.push(reminderDiff.years + ' ' + (reminderDiff.years > 1 ? guild.translate("timeUnits:years") : guild.translate("timeUnits:year")));
                    if(reminderDiff.months > 0)
                        reminderAgo.push(reminderDiff.months + ' ' + (reminderDiff.months > 1 ? guild.translate("timeUnits:months") : guild.translate("timeUnits:month")));
                    if(reminderDiff.days > 0)
                        reminderAgo.push(reminderDiff.days + ' ' + (reminderDiff.days > 1 ? guild.translate("timeUnits:days") : guild.translate("timeUnits:day")));
                    if(reminderDiff.hours > 0)
                        reminderAgo.push(reminderDiff.hours + ' ' + (reminderDiff.hours > 1 ? guild.translate("timeUnits:hours") : guild.translate("timeUnits:hour")));
                    if(reminderDiff.minutes > 0)
                        reminderAgo.push(reminderDiff.minutes + ' ' + (reminderDiff.minutes > 1 ? guild.translate("timeUnits:minutes") : guild.translate("timeUnits:minute")));
                    if(reminderDiff.seconds > 0)
                        reminderAgo.push(reminderDiff.seconds + ' ' + (reminderDiff.seconds > 1 ? guild.translate("timeUnits:seconds") : guild.translate("timeUnits:second")));

                    return reminderAgo.join(', ');
                }


                let generateEmbed = async start => {
                    const current = reminders.slice(start, start + 5);
                    let text = '{text}'
                        .replace('{text}',
                            current.map(reminder => (
                                '\n\n**'+ this.client.emotes.arrow +" " + reminder.reason + '**\n' + '» ' + guild.translate("misc/reminder:main:setup") + positiveTimeRelative(reminder.startDate) + '\n' + '» ' + guild.translate("misc/reminder:main:ends") + negativeTimeRelative(reminder.endDate) + '\n' + '» ' + guild.translate("misc/reminder:main:id") + reminder.id
                            )).join(''));

                    let pagesTotal = Math.ceil(reminders.length / 5);
                    if (pagesTotal === 0) pagesTotal = 1;
                    let currentPage = Math.round(start / 5) + 1;

                    if(reminders.length === 0){
                        text = guild.translate("language:noEntries");
                    }
                    return new EmbedBuilder()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setTitle(guild.translate("misc/reminder:main:showing")
                            .replace('{page}', currentPage)
                            .replace('{pages}', pagesTotal))
                        .setDescription(text)
                        .setThumbnail(user.displayAvatarURL({dynamic: true}))
                        .setColor(this.client.embedColor)
                        .setFooter({text: this.client.footer});
                }

                const canFitOnePage = reminders.length <= 5;
                const embedMessage = await clicked.update({
                    embeds : [await generateEmbed(0)],
                    components: canFitOnePage
                        ? []
                        : [new ActionRowBuilder({components: [forwardButton]})],
                })

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
                                    ...(currentIndex + 5 < reminders.length ? [forwardButton] : [])
                                ]
                            })
                        ]
                    })
                })
            }
            if (clicked.customId === 'reminder_' + id + '_delete') {

                let key = this.client.randomKey(10);
                const reminderModal = new ModalBuilder()
                    .setCustomId(id + '_reminder_modal' + '_' + key)
                    .setTitle(guild.translate("misc/reminder:main:deleteModal:title"));

                const idInput = new TextInputBuilder()
                    .setCustomId('id')
                    .setLabel(guild.translate("language:collectors:id"))
                    .setStyle(TextInputStyle.Short);

                let firstModalRow = new ActionRowBuilder().addComponents(idInput);

                reminderModal.addComponents(firstModalRow);

                await clicked.showModal(reminderModal);

                const submitted = await clicked.awaitModalSubmit({
                    time: 600000,
                    filter: i => i.user.id = user.id
                }).catch(() => {});

                if (submitted) {
                    if (submitted.customId !== id + '_reminder_modal' + '_' + key) return;

                    let idInput = submitted.fields.getTextInputValue('id');

                    if(reminderManager.isReminder(idInput, data.memberData)){
                        await reminderManager.deleteReminder(idInput, data.memberData);
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("misc/reminder:main:deleted")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter({text: this.client.footer});
                        return submitted.update({embeds: [embed], components: []});
                    }else{
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:invalid:id")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: this.client.footer});
                        return submitted.update({embeds: [embed], components: []});
                    }
                }else{
                    let embed = new EmbedBuilder()
                        .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website })
                        .setDescription(guild.translate("language:timeEnded")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter({ text: this.client.footer });
                    return submitted.update({ embeds: [embed], components: [] });
                }
            }
        }
    }
}
module.exports = Reminder;
