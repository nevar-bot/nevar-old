const BaseCommand = require('@structures/BaseCommand');
const { ChannelType, SlashCommandBuilder } = require('discord.js');
const { stringIsEmoji, stringIsCustomEmoji } = require("@helpers/Utils");

class Reactionrole extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "reactionrole",
            description: "Erstellt eine Reactionrole",

            memberPermissions: ["ManageGuild"],
            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addChannelOption(option => option
                        .setName("channel")
                        .setDescription("Wähle einen Channel")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                    )
                    .addStringOption(option => option
                        .setName("id")
                        .setDescription("Gib die ID der Nachricht an")
                        .setRequired(true)
                    )
                    .addRoleOption(option => option
                        .setName("rolle")
                        .setDescription("Wähle eine Rolle")
                        .setRequired(true)
                    )
                    .addStringOption(option => option
                        .setName("emoji")
                        .setDescription("Gib einen Emoji an")
                        .setRequired(true)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data){
        this.interaction = interaction;

        await this.addReactionRole(interaction.options.getChannel("channel"), interaction.options.getString("id"), interaction.options.getRole("rolle"), interaction.options.getString("emoji"), data);
    }

    async addReactionRole(channel, id, role, emote, data){
        // Role is @everyone
        if(role.id === this.interaction.guild.roles.everyone.id){
            const everyoneEmbed = this.client.createEmbed("Die @everyone Rolle kann nicht als eine Reactionrole hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [everyoneEmbed] });
        }

        // Role is managed by an integration
        if(role.managed){
            const roleIsManagedEmbed = this.client.createEmbed("Rollen welche durch eine Integration verwaltet werden, können nicht als Reactionrole hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
        }

        // Role is higher than the bot's highest role
        if(this.interaction.guild.members.me.roles.highest.position <= role.position){
            const roleIsTooHighEmbed = this.client.createEmbed("Da {0} eine höhere oder gleiche Position wie meine höchste Rolle ({1}) hat, kann sie nicht als Reactionrole hinzugefügt werden.", "error", "error", role, this.interaction.guild.members.me.roles.highest);
            return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
        }

        // Invalid emoji
        if(!stringIsEmoji(emote) && !stringIsCustomEmoji(emote)){
            const invalidEmojiEmbed = this.client.createEmbed("Du musst einen gültigen Emoji angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidEmojiEmbed] });
        }

        // Get emoji id if string is custom emoji
        const originEmote = emote;
        if(stringIsCustomEmoji(emote)) emote = emote.replace(/<a?:\w+:(\d+)>/g, "$1");
        // Emoji not available
        if(stringIsCustomEmoji(originEmote) && !this.client.emojis.cache.find((e) => e.id === emote)){
            const unusableEmojiEmbed = this.client.createEmbed("Der Emoji muss auf einem Server wo ich bin verfügbar sein.", "error", "error");
            return this.interaction.followUp({ embeds: [unusableEmojiEmbed] });
        }

        // Get message
        const message = await channel.messages.fetch(id).catch(() => {});
        // Message not found
        if(!message){
            const messageNotFoundEmbed = this.client.createEmbed("Die Nachricht konnte nicht gefunden werden.", "error", "error");
            return this.interaction.followUp({ embeds: [messageNotFoundEmbed] });
        }

        // Save to database
        const channelId = channel.id;
        const messageId = id;
        let emoteId;
        stringIsCustomEmoji(originEmote) ? emoteId = emote : emoteId = originEmote;
        const roleId = role.id;

        const reactionRole = {
            channelId: channelId,
            messageId: messageId,
            emoteId: emoteId,
            roleId: roleId
        }
        data.guild.settings.reactionroles.push(reactionRole);
        data.guild.markModified("settings.reactionroles");
        await data.guild.save();

        await message.react(emote).catch(() => {
            const reactionFailedEmbed = this.client.createEmbed("Ich konnte nicht auf die Nachricht reagieren.", "error", "error");
            return this.interaction.followUp({ embeds: [reactionFailedEmbed] });
        });

        const successEmbed = this.client.createEmbed("Die Reactionrole wurde hinzugefügt.", "success", "success");
        return this.interaction.followUp({ embeds: [successEmbed] });
    }
}

module.exports = Reactionrole;
