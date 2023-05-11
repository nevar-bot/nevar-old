const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const ms = require("enhanced-ms")("de");

class Autodelete extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "autodelete",
            description: "Richtet ein Autodelete ein",

            memberPermissions: ["ManageGuild", "ManageMessages"],
            botPermissions: ["ManageMessages"],

            cooldown: 3000,
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
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                    )
                    .addStringOption(option => option
                        .setName("zeit")
                        .setRequired(false)
                        .setDescription("Gib eine Zeit an")
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        const action = interaction.options.getString("aktion");
        switch (action){
            case "add":
                await this.addAutodelete(interaction.options.getChannel("channel"), interaction.options.getString("zeit"), data);
                break;
            case "remove":
                await this.removeAutodelete(interaction.options.getChannel("channel"), data);
                break;
            case "list":
                await this.showList(data);
                break;
            default:
                const unexpectedErrorEmbed = this.client.createEmbed("Ein unerwarteter Fehler ist aufgetreten.", "error", "error");
                return this.interaction.followUp({ embeds: [unexpectedErrorEmbed] });
        }
    }

    async addAutodelete(channel, time, data){
        // Invalid options
        if(!ms(time) || !channel || !channel.id) {
            const invalidOptionsEmbed = this.client.createEmbed("Du musst eine Channel- und eine Zeitangabe machen.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        // Already exists for this channel
        if(data.guild.settings.autodelete.find(x => x.split("|")[0] === channel.id)){
            const alreadyExistsEmbed = this.client.createEmbed("Für {0} ist bereits ein Autodelete eingerichtet.", "error", "error", channel);
            return this.interaction.followUp({ embeds: [alreadyExistsEmbed] });
        }

        const timeInMs = ms(time);
        const msInTime = ms(ms(time));

        // Time is too short
        if(timeInMs < 1000){
            const tooShortEmbed = this.client.createEmbed("Die Zeit muss mindestens 1 Sekunde betragen.", "error", "error");
            return this.interaction.followUp({ embeds: [tooShortEmbed] });
        }
        // Time is too long
        if(timeInMs > 604800000){
            const tooLongEmbed = this.client.createEmbed("Die Zeit darf maximal 7 Tage betragen.", "error", "error");
            return this.interaction.followUp({ embeds: [tooLongEmbed] });
        }

        // Save to database
        data.guild.settings.autodelete.push(channel.id + "|" + timeInMs);
        data.guild.markModified("settings.autodelete");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("In {0} werden neue Nachrichten automatisch nach {1} gelöscht.", "success", "success", channel, msInTime);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async removeAutodelete(channel, data){
        // Invalid options
        if(!channel || !channel.id){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst eine Channelangabe machen.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        // Doesn't exist for this channel
        if(!data.guild.settings.autodelete.find(x => x.split("|")[0] === channel.id)){
            const doesntExistEmbed = this.client.createEmbed("Für {0} ist kein Autodelete eingerichtet.", "error", "error", channel);
            return this.interaction.followUp({ embeds: [doesntExistEmbed] });
        }

        // Remove from database
        data.guild.settings.autodelete = data.guild.settings.autodelete.filter(x => x.split("|")[0] !== channel.id);
        data.guild.markModified("settings.autodelete");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("In {0} werden neue Nachrichten nicht mehr automatisch gelöscht.", "success", "success", channel);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async showList(data){
        let response = data.guild.settings.autodelete;
        const autodeleteArray = [];

        for(let i = 0; i < response.length; i++){
            const cachedChannel = this.interaction.guild.channels.cache.get(response[i].split("|")[0]);
            if(!cachedChannel){
                response.splice(i, 1);
            }else{
                autodeleteArray.push("**" + cachedChannel.name + "** × " + ms(ms(response[i].split("|")[1])));
            }
        }
        if(data.guild.settings.autodelete !== response){
            data.guild.settings.autodelete = response;
            data.guild.markModified("settings.autodelete");
            await data.guild.save();
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, autodeleteArray, "Autodelete", "Es ist kein Autodelete eingestellt", "channel");
    }

}

module.exports = Autodelete;