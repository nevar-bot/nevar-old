const Command = require('../../structures/BaseCommand');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');
const Resolver ="test";

class Suggestsettings extends Command {

    constructor(client) {
        super(client, {
            name: "suggestsettings",
            description: "administration/suggestsettings:general:description",
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

    async run(interaction, args, data) {
        const { guild, member, channel, user } = interaction;
        const id = user.id;

        if(!data.guild.plugins?.suggestionSystem){
            data.guild.plugins.suggestionSystem = {
                enabled: false,
                channel: null,
                modChannel: null
            }
            data.guild.markModified("plugins.suggestionSystem");
            await data.guild.save();
        }

        let embed = new EmbedBuilder()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("language:collectors:action")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter({text: this.client.footer});

        let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('setsuggest_' + id + '_channel')
                    .setLabel(guild.translate("administration/suggestsettings:main:buttonLabels:1"))
                    .setEmoji(this.client.emotes.edit)
                    .setDisabled(!data.guild.plugins.suggestionSystem.enabled)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('setsuggest_' + id + '_modchannel')
                    .setLabel(guild.translate("administration/suggestsettings:main:buttonLabels:2"))
                    .setEmoji(this.client.emotes.edit)
                    .setDisabled(!data.guild.plugins.suggestionSystem.enabled)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('setsuggest_' + id + '_enable')
                    .setLabel(guild.translate("administration/suggestsettings:main:buttonLabels:3"))
                    .setEmoji(this.client.emotes.enable)
                    .setDisabled(data.guild.plugins.suggestionSystem.enabled)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('setsuggest_' + id + '_disable')
                    .setLabel(guild.translate("administration/suggestsettings:main:buttonLabels:4"))
                    .setEmoji(this.client.emotes.disable)
                    .setDisabled(!data.guild.plugins.suggestionSystem.enabled)
                    .setStyle(ButtonStyle.Secondary),
            )
        let sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('setsuggest_' + id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({ filter }).catch(() => {})

        if (clicked) {
            if (clicked.customId === 'setsuggest_' + id + '_channel') {
                let key = this.client.randomKey(10);

                const suggestChannelModal = new ModalBuilder()
                    .setCustomId(id + '_suggestchannel_modal' + '_' + key)
                    .setTitle(guild.translate("administration/suggestsettings:main:suggestModal:title"));

                const channelInput = new TextInputBuilder()
                    .setCustomId('channel')
                    .setLabel(guild.translate("language:collectors:channel"))
                    .setMinLength(1)
                    .setStyle(TextInputStyle.Short);

                let firstModalRow = new ActionRowBuilder().addComponents(channelInput);

                suggestChannelModal.addComponents(firstModalRow);

                await clicked.showModal(suggestChannelModal);

                const submitted = await clicked.awaitModalSubmit({
                    time: 600000,
                    filter: i => i.user.id = user.id
                }).catch(() => {});

                if (submitted) {
                    if(submitted.customId !== id + '_suggestchannel_modal' + '_' + key) return;

                    let channel = submitted.fields.getTextInputValue('channel');

                    let channelInput = await Resolver.channelResolver(channel, guild, "GuildText");

                    if(channelInput){
                        data.guild.plugins.suggestionSystem.channel = channelInput.id;
                        data.guild.markModified("plugins.suggestionSystem");
                        await data.guild.save();
                        // SUGGEST COMMAND EINBINDEN
                        let suggestId = 0;
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("administration/suggestsettings:main:suggestChannelSet")
                                .replace('{emotes.success}', this.client.emotes.success)
                                .replace('{command}', "</suggest:" + suggestId + ">")
                                .replace('{channel}', channelInput))
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
            if (clicked.customId === 'setsuggest_' + id + '_modchannel') {
                let key = this.client.randomKey(10);

                const suggestChannelModal = new ModalBuilder()
                    .setCustomId(id + '_modsuggest_modal' + '_' + key)
                    .setTitle(guild.translate("administration/suggestsettings:main:modModal:title"));

                const channelInput = new TextInputBuilder()
                    .setCustomId('channel')
                    .setLabel(guild.translate("administration/suggestsettings:main:modModal:labels:channel"))
                    .setMinLength(1)
                    .setStyle(TextInputStyle.Short);

                let firstModalRow = new ActionRowBuilder().addComponents(channelInput);

                suggestChannelModal.addComponents(firstModalRow);

                await clicked.showModal(suggestChannelModal);

                const submitted = await clicked.awaitModalSubmit({
                    time: 600000,
                    filter: i => i.user.id = user.id
                }).catch(() => {});

                if (submitted) {
                    if(submitted.customId !== id + '_modsuggest_modal' + '_' + key) return;

                    let channel = submitted.fields.getTextInputValue('channel');

                    let channelInput = await Resolver.channelResolver(channel, guild, "GuildText");

                    if(channelInput){
                        data.guild.plugins.suggestionSystem.modChannel = channelInput.id;
                        data.guild.markModified("plugins.suggestionSystem");
                        await data.guild.save();
                        // SUGGEST COMMAND EINBINDEN
                        let suggestId = 0;
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("administration/suggestsettings:main:modChannelSet")
                                .replace('{emotes.success}', this.client.emotes.success)
                                .replace('{command}', "</suggest:" + suggestId + ">")
                                .replace('{channel}', channelInput))
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
            if (clicked.customId === 'setsuggest_' + id + '_enable') {
                data.guild.plugins.suggestionSystem.enabled = true;
                data.guild.markModified("plugins.suggestionSystem");
                await data.guild.save();
                let embed = new EmbedBuilder()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("administration/suggestsettings:main:enabled")
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter({text: this.client.footer});
                return clicked.update({embeds: [embed], components: []});
            }
            if (clicked.customId === 'setsuggest_' + id + '_disable') {
                data.guild.plugins.suggestionSystem.enabled = false;
                data.guild.markModified("plugins.suggestionSystem");
                await data.guild.save();
                let embed = new EmbedBuilder()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("administration/suggestsettings:main:disabled")
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter({text: this.client.footer});
                return clicked.update({embeds: [embed], components: []});
            }
        }
    }
}
module.exports = Suggestsettings;
