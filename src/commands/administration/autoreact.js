const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, ChannelType } = require('discord.js')
const { stringIsEmoji, stringIsCustomEmoji } = require("@helpers/Utils");

class Autoreact extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "autoreact",
            description: "Reagiert auf neue Nachrichten automatisch mit festgelegten Emojis",

            memberPermissions: ["ManageGuild"],
            botPermissions: ["AddReactions"],

            cooldown: 2000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option => option
                        .setName("aktion")
                        .setDescription("Wähle eine Aktion")
                        .setRequired(true)
                        .addChoices(
                            { name: "hinzufügen", value: "add" },
                            { name: "entfernen", value: "remove" },
                            { name: "liste", value: "list" }
                        )
                    )
                    .addChannelOption(option => option
                        .setName("channel")
                        .setDescription("Wähle einen Channel")
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews, ChannelType.GuildForum)
                    )
                    .addStringOption(option => option
                        .setName("emoji")
                        .setDescription("Gib einen Emoji an")
                        .setRequired(false)
                    )
            }
        });
    }

    static interaction;

    async dispatch(interaction, data) {
        this.interaction = interaction;

        const action = interaction.options.getString("aktion");

        switch (action) {
            case "add":
                await this.addAutoReact(data, interaction.options.getChannel("channel"), interaction.options.getString("emoji"));
                break;
            case "remove":
                await this.removeAutoReact(data, interaction.options.getChannel("channel"), interaction.options.getString("emoji"));
                break;
            case "list":
                await this.showList(data);
                break;
            default:
                const unexpectedErrorEmbed = this.client.createEmbed("Ein unerwarteter Fehler ist aufgetreten.", "error", "error");
                return this.interaction.followUp({embeds: [unexpectedErrorEmbed]});
        }
    }

    async addAutoReact(data, channel, emote){
        // Missing arguments
        if(!channel || !channel.id || !emote){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst eine Channel- und eine Emojiangabe machen.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
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

        // Emoji is already added to this channel
        if(data.guild.settings.autoreact.find(r => r.split("|")[0] === channel.id && r.split("|")[1] === emote)){
            const alreadyAddedEmbed = this.client.createEmbed("Dieser Emoji ist in {0} bereits zum Autoreact hinzugefügt.", "error", "error", channel);
            return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
        }

        // Save to database
        data.guild.settings.autoreact.push(channel.id + "|" + emote);
        data.guild.markModified("settings.autoreact");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("Ich habe {0} in {1} zum Autoreact hinzugefügt.", "success", "success", originEmote, channel);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async removeAutoReact(data, channel, emote){
        // Missing arguments
        if(!channel || !channel.id || !emote){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst eine Channel- und eine Emojiangabe machen.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        // Invalid emoji
        if(!stringIsEmoji(emote) && !stringIsCustomEmoji(emote)){
            const invalidEmojiEmbed = this.client.createEmbed("Du musst einen gültigen Emoji angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidEmojiEmbed] });
        }

        // Get emoji id if string is custom emoji
        const originEmote = emote;
        if(stringIsCustomEmoji(emote)) emote = emote.replace(/<a?:\w+:(\d+)>/g, "$1");

        // Emoji is not added to this channel
        if(!data.guild.settings.autoreact.find(r => r.split("|")[0] === channel.id && r.split("|")[1] === emote)){
            const alreadyAddedEmbed = this.client.createEmbed("Dieser Emoji ist in {0} nicht zum Autoreact hinzugefügt.", "error", "error", channel);
            return this.interaction.followUp({ embeds: [alreadyAddedEmbed] });
        }

        // Save to database
        data.guild.settings.autoreact = data.guild.settings.autoreact.filter(r => r.split("|")[0] !== channel.id || r.split("|")[1] !== emote);
        data.guild.markModified("settings.autoreact");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("Ich habe {0} in {1} vom Autoreact entfernt.", "success", "success", originEmote, channel);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async showList(data){
        let response = data.guild.settings.autoreact;
        const sortedAutoReactArray = [];
        const finalSortedAutoReactArray = [];

        for(let i = 0; i < response.length; i++){
            const cachedChannel = this.interaction.guild.channels.cache.get(response[i].split("|")[0]);
            if(!cachedChannel){
                response.splice(i, 1);
            }else{
                const cachedEmoji = this.client.emojis.cache.get(response[i].split("|")[1]);
                if(!sortedAutoReactArray[cachedChannel.name]) sortedAutoReactArray[cachedChannel.name] = [];
                sortedAutoReactArray[cachedChannel.name].push(cachedEmoji ? cachedEmoji.toString() : response[i].split("|")[1])
            }
        }

        for(let item in sortedAutoReactArray){
            finalSortedAutoReactArray.push("**" + item + "** × " + sortedAutoReactArray[item].join(" "))
        }
        if(data.guild.settings.autoreact !== response){
            data.guild.settings.autoreact = response;
            data.guild.markModified("settings.autoreact");
            await data.guild.save();
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, finalSortedAutoReactArray, "Autoreact", "Es ist kein Autoreact eingestellt", "channel");
    }
}

module.exports = Autoreact;