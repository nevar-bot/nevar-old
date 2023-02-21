const Command = require('../../structures/BaseCommand');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');

function isImage(url) {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/.test(url);
}

class Embed extends Command {
    constructor(client) {
        super(client, {
            name: "embed",
            description: "administration/embed:general:description",
            memberPermissions: ["ManageGuild"],
            botPermissions: ["ManageWebhooks"],
            cooldown: 30000,
            dirname: __dirname,
            slashCommand: {
                addCommand: false,
                data: new SlashCommandBuilder()
            }
        });
    }
    async run(interaction, args, data) {
        const { guild, member, channel, user } = interaction;

        const id = user.id;

        let authorText, authorInEmbed, authorIcon, title, thumbnail, image, description, footerText, footerIcon, color;

        let key = this.client.randomKey(10);

        const embedModal = new ModalBuilder()
            .setCustomId(id + '_embed_modal' + '_' + key)
            .setTitle(guild.translate("administration/embed:main:modal:title"));

        const authorTextInput = new TextInputBuilder()
            .setCustomId('authortext')
            .setLabel(guild.translate("administration/embed:main:modal:labels:author"))
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(guild.translate("administration/embed:main:modal:placeholders:author"))
            .setMinLength(1)
            .setMaxLength(32);
        const authorInEmbedInput = new TextInputBuilder()
            .setCustomId('authorinembed')
            .setLabel(guild.translate("administration/embed:main:modal:labels:authorInEmbed"))
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(guild.translate("administration/embed:main:modal:placeholders:authorInEmbed"))
            .setMinLength(2)
            .setMaxLength(4);
        const authorIconInput = new TextInputBuilder()
            .setCustomId('authoricon')
            .setLabel(guild.translate("administration/embed:main:modal:labels:authorIcon"))
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(guild.translate("administration/embed:main:modal:placeholders:authorIcon"))
            .setRequired(false);
        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel(guild.translate("administration/embed:main:modal:labels:title"))
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(guild.translate("administration/embed:main:modal:placeholders:title"))
            .setMinLength(1)
            .setMaxLength(256);
        const descriptionInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel(guild.translate("administration/embed:main:modal:labels:description"))
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder(guild.translate("administration/embed:main:modal:placeholders:description"))
            .setMinLength(1);

        let modalRow1 = new ActionRowBuilder().addComponents(authorTextInput);
        let modalRow2 = new ActionRowBuilder().addComponents(authorInEmbedInput);
        let modalRow3 = new ActionRowBuilder().addComponents(authorIconInput);
        let modalRow4 = new ActionRowBuilder().addComponents(titleInput);
        let modalRow5 = new ActionRowBuilder().addComponents(descriptionInput);
        embedModal.addComponents(modalRow1, modalRow2, modalRow3, modalRow4, modalRow5);
        await interaction.showModal(embedModal);
        const submitted = await interaction.awaitModalSubmit({
            time: 3600000,
            filter: i => i.user.id = user.id
        }).catch(() => {});

        if (submitted) {
            if(submitted.customId !== id + '_embed_modal' + '_' + key) return;

            authorText = submitted.fields.getTextInputValue('authortext');
            authorInEmbed = submitted.fields.getTextInputValue('authorinembed').toLowerCase() === guild.translate("administration/embed:main:modal:booleans:true").toLowerCase();

            if (isImage(submitted.fields.getTextInputValue('authoricon'))) authorIcon = submitted.fields.getTextInputValue('authoricon');
            else authorIcon = "/";

            title = submitted.fields.getTextInputValue('title');
            description = submitted.fields.getTextInputValue('description');

            if (authorText && (typeof authorInEmbed !== "undefined") && authorIcon && title && description) {
                let embed = new EmbedBuilder()
                    .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website })
                    .setDescription(guild.translate("administration/embed:main:next")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter({ text: this.client.footer });

                let row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('modal_' + id + '_next')
                            .setLabel(guild.translate("administration/embed:main:modal:buttonLabels:0"))
                            .setStyle(ButtonStyle.Secondary));

                await submitted.deferReply();
                let sent = await submitted.followUp({
                    embeds: [embed],
                    components: [row],
                    fetchReply: true
                });
                const filter = i => i.customId.startsWith('modal_' + id) && i.user.id === id;
                const clicked = await sent.awaitMessageComponent({
                    filter
                }).catch(() => {});
                if (clicked) {
                    if (clicked.customId === 'modal_' + id + '_next') {
                        const secondEmbedModal = new ModalBuilder()
                            .setCustomId(id + '_second_embed_modal')
                            .setTitle(guild.translate("administration/embed:main:modal:title"));
                        const thumbnailInput = new TextInputBuilder()
                            .setCustomId('thumbnail')
                            .setLabel(guild.translate("administration/embed:main:modal:labels:thumbnail"))
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder(guild.translate("administration/embed:main:modal:placeholders:thumbnail"))
                            .setRequired(false);
                        const imageInput = new TextInputBuilder()
                            .setCustomId('image')
                            .setLabel(guild.translate("administration/embed:main:modal:labels:image"))
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder(guild.translate("administration/embed:main:modal:placeholders:image"))
                            .setRequired(false);
                        const footerIconInput = new TextInputBuilder()
                            .setCustomId('footericon')
                            .setLabel(guild.translate("administration/embed:main:modal:labels:footerIcon"))
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder(guild.translate("administration/embed:main:modal:placeholders:footerIcon"))
                            .setRequired(false);
                        const footerTextInput = new TextInputBuilder()
                            .setCustomId('footertext')
                            .setLabel(guild.translate("administration/embed:main:modal:labels:footerText"))
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder(guild.translate("administration/embed:main:modal:placeholders:footerText"))
                            .setRequired(false)
                            .setMaxLength(128);
                        const colorInput = new TextInputBuilder()
                            .setCustomId('color')
                            .setLabel(guild.translate("administration/embed:main:modal:labels:color"))
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder(guild.translate("administration/embed:main:modal:placeholders:color"))
                            .setRequired(false);

                        let modalRow1 = new ActionRowBuilder().addComponents(thumbnailInput);
                        let modalRow2 = new ActionRowBuilder().addComponents(imageInput);
                        let modalRow3 = new ActionRowBuilder().addComponents(footerIconInput);
                        let modalRow4 = new ActionRowBuilder().addComponents(footerTextInput);
                        let modalRow5 = new ActionRowBuilder().addComponents(colorInput);
                        secondEmbedModal.addComponents(modalRow1, modalRow2, modalRow3, modalRow4, modalRow5);
                        await clicked.showModal(secondEmbedModal);
                        const submitted = await interaction.awaitModalSubmit({
                            time: 3600000,
                            filter: i => i.user.id = user.id
                        }).catch(() => {});
                        if (submitted) {
                            await submitted.deferReply();

                            if (isImage(submitted.fields.getTextInputValue('thumbnail'))) thumbnail = submitted.fields.getTextInputValue('thumbnail');
                            else thumbnail = "/";

                            if (isImage(submitted.fields.getTextInputValue('image'))) image = submitted.fields.getTextInputValue('image');
                            else image = "/";

                            if (isImage(submitted.fields.getTextInputValue('footericon'))) footerIcon = submitted.fields.getTextInputValue('footericon');
                            else footerIcon = "/";

                            footerText = submitted.fields.getTextInputValue('footertext');
                            color = submitted.fields.getTextInputValue('color') === "" ? this.client.embedColor : submitted.fields.getTextInputValue('color');

                            function isHexColor(hex) {
                                return typeof hex === 'string' && hex.length === 6 && !isNaN(Number('0x' + hex))
                            }
                            if (color !== this.client.embedColor) {
                                if (!isHexColor(color.replace('#', ''))) {
                                    let rgbToHex = function (rgb) {
                                        let hex = Number(rgb).toString(16);
                                        if (hex.length < 2) {
                                            hex = "0" + hex;
                                        }
                                        return hex;
                                    };
                                    let fullColorHex = function (r, g, b) {
                                        let red = rgbToHex(r);
                                        let green = rgbToHex(g);
                                        let blue = rgbToHex(b);
                                        return red + green + blue;
                                    };
                                    let r = parseInt(color.split(', ')[0]);
                                    let g = parseInt(color.split(', ')[1]);
                                    let b = parseInt(color.split(', ')[2]);
                                    if (isHexColor(fullColorHex(r, g, b))) {
                                        color = fullColorHex(r, g, b);
                                    }
                                }
                            }
                            if (!isHexColor(color.replace('#', ''))) color = this.client.embedColor;
                            if (thumbnail && image && footerIcon && footerText && color) {
                                const generatedEmbed = new EmbedBuilder();
                                if (authorInEmbed) {
                                    if (authorIcon !== "/") {
                                        generatedEmbed.setAuthor({ name: authorText, iconURL: authorIcon, url: this.client.website })
                                    } else {
                                        generatedEmbed.setAuthor({ name: authorText, iconURL: null, url: this.client.website });
                                    }
                                }
                                if (color) generatedEmbed.setColor(color);
                                if (title) generatedEmbed.setTitle(title);
                                if (thumbnail !== "/") {
                                    generatedEmbed.setThumbnail(thumbnail)
                                }
                                if (image !== "/") {
                                    generatedEmbed.setImage(thumbnail)
                                }
                                if (description) generatedEmbed.setDescription(description);
                                if (footerText && (footerIcon !== "/")) {
                                    generatedEmbed.setFooter({ text: footerText, iconURL: footerIcon })
                                } else {
                                    if (footerText) {
                                        generatedEmbed.setFooter({ text: footerText })
                                    } else if (footerIcon !== "/") {
                                        generatedEmbed.setFooter({ text: '', iconURL: footerIcon })
                                    }
                                }
                                let webhook = await channel.createWebhook({
                                    name: authorText,
                                    avatar: (authorIcon !== "/") ? authorIcon : 'https://preview.redd.it/lnine7vviw791.png?auto=webp&s=9361f108e0959a8849c016396b2448bbb79e6861'
                                }).catch(() => {});

                                await webhook.send({
                                    embeds: [generatedEmbed]
                                }).catch(async (err) => {
                                    let errorEmbed = new EmbedBuilder()
                                        .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website })
                                        .setDescription(guild.translate("administration/embed:main:modal:errors:unknown")
                                            .replace('{emotes.error}', this.client.emotes.error))
                                        .setColor(this.client.embedColor)
                                        .setFooter({ text: this.client.footer });
                                    await sent.delete().catch(() => {});
                                    return submitted.followUp({
                                        embeds: [errorEmbed],
                                        components: []
                                    });
                                }).then(async () => {
                                    let successfullEmbed = new EmbedBuilder()
                                        .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website })
                                        .setDescription(guild.translate("administration/embed:main:modal:generated")
                                            .replace('{emotes.success}', this.client.emotes.success))
                                        .setColor(this.client.embedColor)
                                        .setFooter({ text: this.client.footer });
                                    await sent.delete().catch(() => {});
                                    return submitted.followUp({
                                        embeds: [successfullEmbed],
                                        components: []
                                    });
                                })
                                await webhook.delete().catch(() => {});
                            } else {
                                let embed = new EmbedBuilder()
                                    .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website })
                                    .setDescription(guild.translate("administration/embed:main:modal:errors:invalid")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter({ text: this.client.footer });
                                await sent.delete().catch(() => {});
                                return submitted.followUp({
                                    embeds: [embed],
                                    components: []
                                });
                            }
                        }
                    }
                }
            } else {
                let embed = new EmbedBuilder()
                    .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website })
                    .setDescription(guild.translate("administration/embed:main:modal:errors:invalid")
                        .replace('{emotes.error}', this.client.emotes.error))
                    .setColor(this.client.embedColor)
                    .setFooter({ text: this.client.footer });
                await sent.delete().catch(() => {});
                return submitted.followUp({
                    embeds: [embed],
                    components: []
                });
            }
        }
    }
}
module.exports = Embed;