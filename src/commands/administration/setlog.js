const BaseCommand = require("@structures/BaseCommand");
const { SlashCommandBuilder, ChannelType } = require("discord.js");

class Setlog extends BaseCommand {
    constructor(client){
        super(client, {
            name: "setlog",
            description: "Setzt die verschiedenen Log-Channel",

            cooldown: 2000,
            memberPermissions: ["ManageGuild"],
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addChannelOption(option => option
                        .setName("moderation")
                        .setDescription("Setzt den Channel, in welchem Moderations-Logs gesendet werden")
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                    )
                    .addChannelOption(option => option
                        .setName("mitglieder")
                        .setDescription("Setzt den Channel, in welchem Logs zu Mitgliedern gesendet werden")
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                    )
                    .addChannelOption(option => option
                        .setName("server")
                        .setDescription("Setzt den Channel, in welchem allgemeine Logs zum Server gesendet werden")
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                    )
                    .addChannelOption(option => option
                        .setName("rollen")
                        .setDescription("Setzt den Channel, in welchem Logs zu Rollen gesendet werden")
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                    )
                    .addChannelOption(option => option
                        .setName("threads")
                        .setDescription("Setzt den Channel, in welchem Logs zu Threads gesendet werden")
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                    )
                    .addChannelOption(option => option
                        .setName("channel")
                        .setDescription("Setzt den Channel, in welchem Logs zu Channels gesendet werden")
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                    )
            }
        })
    }

    static interaction;
    async dispatch(interaction, data){
        this.interaction = interaction;

        if(!data.guild.settings.logs) {
            data.guild.settings.logs = {
                enabled: true,
                channels: {
                    moderation: null,
                    member: null,
                    guild: null,
                    role: null,
                    thread: null,
                    channel: null,
                }
            }
            data.guild.markModified("settings.logs");
            await data.guild.save();
        }

        await this.setLogs(data);
    }

    async setLogs(data){
        const moderation = this.interaction.options.getChannel("moderation");
        const members = this.interaction.options.getChannel("mitglieder");
        const server = this.interaction.options.getChannel("server");
        const roles = this.interaction.options.getChannel("rollen");
        const threads = this.interaction.options.getChannel("threads");
        const channel = this.interaction.options.getChannel("channel");

        if(moderation) data.guild.settings.logs.channels.moderation = moderation.id;
        if(members) data.guild.settings.logs.channels.member = members.id;
        if(server) data.guild.settings.logs.channels.guild = server.id;
        if(roles) data.guild.settings.logs.channels.role = roles.id;
        if(threads) data.guild.settings.logs.channels.thread = threads.id;
        if(channel) data.guild.settings.logs.channels.channel = channel.id;

        data.guild.markModified("settings.logs");
        await data.guild.save();

        const successEmbed = this.client.generateEmbed("Die Log-Channel wurden gesetzt.", "success", "success");
        return this.interaction.followUp({ embeds: [successEmbed] });
    }
}

module.exports = Setlog;