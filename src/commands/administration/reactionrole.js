const Command = require('../../structures/BaseCommand');
const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder, parseEmoji} = require('discord.js');
const Resolver ="test";

class Reactionrole extends Command {

    constructor(client) {
        super(client, {
            name: "reactionrole",
            description: "administration/reactionrole:general:description",
            memberPermissions: ["ManageGuild"],
            cooldown: 5000,
            dirname: __dirname,
            slashCommand: {
                addCommand: false,
                data:
                    new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, args, data){
        const { guild, member, channel, user } = interaction;

        const id = user.id;

        let key = this.client.randomKey(10);

        const reactionroleModal = new ModalBuilder()
            .setCustomId(id + '_reactionrole_modal' + '_' + key)
            .setTitle(guild.translate("administration/reactionrole:main:modal:title"));

        const channelInput = new TextInputBuilder()
            .setCustomId('channel')
            .setLabel(guild.translate("language:collectors:channel"))
            .setStyle(TextInputStyle.Short);
        const idInput = new TextInputBuilder()
            .setCustomId('id')
            .setLabel(guild.translate("administration/reactionrole:main:modal:labels:id"))
            .setStyle(TextInputStyle.Short);
        const emojiInput = new TextInputBuilder()
            .setCustomId('emoji')
            .setLabel(guild.translate("language:collectors:emoji"))
            .setStyle(TextInputStyle.Short);
        const roleInput = new TextInputBuilder()
            .setCustomId('role')
            .setLabel(guild.translate("language:collectors:role"))
            .setStyle(TextInputStyle.Short);

        let channelInputRow = new ActionRowBuilder().addComponents(channelInput);
        let idInputRow = new ActionRowBuilder().addComponents(idInput);
        let emojiInputRow = new ActionRowBuilder().addComponents(emojiInput);
        let roleInputRow = new ActionRowBuilder().addComponents(roleInput);

        reactionroleModal.addComponents(channelInputRow, idInputRow, emojiInputRow, roleInputRow);

        await interaction.showModal(reactionroleModal);

        const submitted = await interaction.awaitModalSubmit({
            time: 600000,
            filter: i => i.user.id = user.id
        }).catch(() => {});

        if (submitted) {
            if(submitted.customId !== id + '_reactionrole_modal' + '_' + key) return;

            let channel = submitted.fields.getTextInputValue('channel');
            let message = submitted.fields.getTextInputValue('id');
            let emoji = submitted.fields.getTextInputValue('emoji');
            let role = submitted.fields.getTextInputValue('role');

            let channelInput = await Resolver.channelResolver(channel, guild, "GuildText");
            if(channelInput){
                let messageInput = await channelInput.messages.fetch(message).catch(() => {});
                if(messageInput){
                    let emojiInput = parseEmoji(emoji);

                    if(!emojiInput?.id){
                        let regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
                        if (regex.test(emoji)) emojiInput = emoji
                    }


                    if(emojiInput){
                        let roleInput = await Resolver.roleResolver(role, guild);
                        if(roleInput){
                            messageInput.react(emojiInput).catch((e) => {console.log(e)});
                            data.guild.plugins.reactionRoles.push(messageInput.id + ' | ' + (emojiInput?.id ? emojiInput.id : emojiInput) + ' | ' + roleInput.id);
                            data.guild.markModified("plugins.reactionRoles");
                            await data.guild.save();
                            let embed = new EmbedBuilder()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("administration/reactionrole:main:setup")
                                    .replace('{emotes.success}', this.client.emotes.success))
                                .setColor(this.client.embedColor)
                                .setFooter({text: this.client.footer});
                            await submitted.deferReply();
                            return submitted.followUp({
                                embeds: [embed]
                            });
                        }else{
                            let embed = new EmbedBuilder()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("administration/reactionrole:main:invalid:role")
                                    .replace('{emotes.success}', this.client.emotes.success))
                                .setColor(this.client.embedColor)
                                .setFooter({text: this.client.footer});
                            await submitted.deferReply();
                            return submitted.followUp({
                                embeds: [embed]
                            });
                        }
                    }else{
                        let embed = new EmbedBuilder()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("administration/reactionrole:main:invalid:emoji")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter({text: this.client.footer});
                        await submitted.deferReply();
                        return submitted.followUp({
                            embeds: [embed]
                        });
                    }
                }else{
                    let embed = new EmbedBuilder()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/reactionrole:main:invalid:id")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: this.client.footer});
                    await submitted.deferReply();
                    return submitted.followUp({
                        embeds: [embed]
                    });
                }
            }else{
                let embed = new EmbedBuilder()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("administration/reactionrole:main:invalid:channel")
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter({text: this.client.footer});
                await submitted.deferReply();
                return submitted.followUp({
                    embeds: [embed]
                });
            }
        }
    }
}

module.exports = Reactionrole;
