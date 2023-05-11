const BaseCommand = require('@structures/BaseCommand');
const { ChannelType, SlashCommandBuilder } = require('discord.js');

class SuggestSystem extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "suggestsystem",
            description: "Verwaltet das Ideen-System",

            memberPermissions: ["ManageGuild"],
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
                            { name: "aktivieren", value: "enable" },
                            { name: "deaktivieren", value: "disable" },
                            { name: "channel", value: "channel" },
                            { name: "reviewchannel", value: "reviewchannel" },
                        )
                    )
                    .addChannelOption(option => option
                        .setName("channel")
                        .setDescription("Wähle einen Channel")
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                        .setRequired(false)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        const action = interaction.options.getString("aktion");
        switch(action){
            case "enable":
                await this.enable(data);
                break;
            case "disable":
                await this.disable(data);
                break;
            case "channel":
                await this.setChannel(interaction.options.getChannel("channel"), data)
                break;
            case "reviewchannel":
                await this.setReviewChannel(interaction.options.getChannel("channel"), data)
                break;
        }
    }

    async enable(data){
        if(data.guild.settings.suggestions.enabled){
            const isAlreadyEnabled = this.client.createEmbed("Das Ideen-System ist bereits aktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [isAlreadyEnabled] });
        }
        data.guild.settings.suggestions.enabled = true;
        data.guild.markModified("settings.suggestions.enabled");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("Das Ideen-System wurde aktiviert.", "success", "success");
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async disable(data){
        if(!data.guild.settings.suggestions.enabled){
            const isAlreadyDisabled = this.client.createEmbed("Das Ideen-System ist bereits deaktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [isAlreadyDisabled] });
        }
        data.guild.settings.suggestions.enabled = false;
        data.guild.markModified("settings.suggestions.enabled");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("Das Ideen-System wurde deaktiviert.", "success", "success");
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async setChannel(channel, data){
        if(!channel){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst einen Channel angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }
        data.guild.settings.suggestions.channel = channel.id;
        data.guild.markModified("settings.suggestions.channel");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("Neue Ideen werden absofort in {0} gesendet.", "success", "success", channel);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async setReviewChannel(channel, data){
        if(!channel){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst einen Channel angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }
        data.guild.settings.suggestions.review_channel = channel.id;
        data.guild.markModified("settings.suggestions.review_channel");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("Neue Ideen werden absofort in {0} verwaltet.", "success", "success", channel);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }
}
module.exports = SuggestSystem;
