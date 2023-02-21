const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');

class Resetwarns extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "resetwarns",
            description: "Setzt die Verwarnungen eines Mitgliedes zurück",

            memberPermissions: ["KickMembers"],
            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                        .addUserOption(option => option
                            .setName("mitglied")
                            .setDescription("Wähle ein Mitglied")
                            .setRequired(true)
                        )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.resetWarns(interaction.options.getUser("mitglied"));
    }

    async resetWarns(user){
        const memberData = await this.client.findOrCreateMember({ id: user.id, guildID: this.interaction.guild.id });

        memberData.warnings = {
            count: 0,
            list: []
        };
        memberData.markModified("warnings");
        await memberData.save();

        const successEmbed = this.client.generateEmbed("Die Verwarnungen von {0} wurden zurückgesetzt.", "success", "success", user.tag);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }
}

module.exports = Resetwarns;
