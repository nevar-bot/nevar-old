const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

class Suggest extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "suggest",
            description: "Reicht eine Idee ein",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option => option
                        .setName("idee")
                        .setDescription("Gib deine Idee ein")
                        .setRequired(true)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.suggest(interaction.options.getString("idee"), data);
    }

    async suggest(idea, data){
        if(!data.guild.settings.suggestions.enabled){
            const isNotEnabled = this.client.generateEmbed("Da das Ideen-System nicht aktiviert ist, können keine Ideen eingereicht werden.", "error", "error");
            return this.interaction.followUp({ embeds: [isNotEnabled] });
        }

        const channel = this.client.channels.cache.get(data.guild.settings.suggestions.channel);
        if(!channel){
            const channelNotFound = this.client.generateEmbed("Der Ideen-Channel wurde nicht gefunden.", "error", "error");
            return this.interaction.followUp({ embeds: [channelNotFound] });
        }

        const successEmbed = this.client.generateEmbed("Deine Idee wurde eingereicht.", "success", "success");
        await this.interaction.followUp({ embeds: [successEmbed] });
        return new(require('@events/interaction/seperations/suggestion/Submitted'))(this.client).dispatch(this.interaction, data, this.interaction.guild, idea);
    }
}
module.exports = Suggest;