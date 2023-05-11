const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, ChannelType } = require('discord.js');

class Join2Create extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "join2create",
            description: "Richtet Join2Create ein",

            memberPermissions: ["ManageGuild"],
            botPermissions: ["ManageChannels"],
            cooldown: 1000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addChannelOption(option => option
                        .setName("channel")
                        .setDescription("Wähle einen Channel")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildVoice)
                    )
                    .addIntegerOption(option => option
                        .setName("limit")
                        .setDescription("Wähle, wieviele Leute maximal in einem Channel sein dürfen (0 = unbegrenzt)")
                        .setMinValue(0)
                        .setMaxValue(99)
                        .setRequired(true)
                    )
                    .addIntegerOption(option => option
                        .setName("bitrate")
                        .setDescription("Wähle die Bitrate (8 - 96kbps, Standard: 64kbps)")
                        .setRequired(true)
                        .setMinValue(8)
                        .setMaxValue(96)
                    )
                    .addStringOption(option => option
                        .setName("name")
                        .setDescription("Setze den Standard-Namen für die Channel (Variablen: {count} und {user})")
                        .setRequired(true)
                    )
                    .addChannelOption(option => option
                        .setName("kategorie")
                        .setDescription("Wähle, in welcher Kategorie die Channel erstellt werden")
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildCategory)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data){
        this.interaction = interaction;

        await this.setJoinToCreate(interaction.options.getChannel("channel"), interaction.options.getInteger("limit"), interaction.options.getInteger("bitrate"), interaction.options.getString("name"), interaction.options.getChannel("kategorie"), data);
    }

    async setJoinToCreate(channel, userlimit, bitrate, name, category, data){

        data.guild.settings.joinToCreate = {
            enabled: true,
            channel: channel.id,
            category: category ? category.id : null,
            userLimit: userlimit,
            bitrate: bitrate,
            defaultName: name,
            channels: []
        };
        data.guild.markModified("settings.joinToCreate");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("Join2Create wurde eingerichtet.", "success", "success");
        return this.interaction.followUp({ embeds: [successEmbed] });
    }
}

module.exports = Join2Create;