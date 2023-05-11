const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');

class RemoveWarn extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "remove-warn",
            description: "Entfernt eine Verwarnung eines Mitglieds",

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
                    .addIntegerOption(option => option
                        .setName("nummer")
                        .setDescription("Gib die Nummer der Verwarnung an")
                        .setRequired(true)
                        .setMinValue(1)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.removeWarn(interaction.options.getUser("mitglied"), interaction.options.getInteger("nummer"));
    }

    async removeWarn(user, num){
        const member = await this.interaction.guild.resolveMember(user.id);
        if(!member){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst ein Mitglied angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }
        const targetData = await this.client.findOrCreateMember({ id: member.user.id, guildID: this.interaction.guild.id });

        if(!targetData.warnings.list[num -1]){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst eine gültige Nummer angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        targetData.warnings.list = targetData.warnings.list.filter((warn) => warn !== targetData.warnings.list[num -1]);
        targetData.markModified("warnings");
        await targetData.save();

        const logText =
            " **Verwarnung von " + member.user.tag + " entfernt**\n\n" +
            this.client.emotes.user + " Moderator: " + this.interaction.user.tag + "\n" +
            this.client.emotes.text + " Warn-Nr.: " + num;
        await this.interaction.guild.logAction(logText, "moderation", this.client.emotes.delete, "normal", member.user.displayAvatarURL({ dynamic: true }));


        const successEmbed = this.client.createEmbed("Die {0}. Verwarnung von {1} wurde entfernt.", "success", "success", num, member.user.tag);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }
}

module.exports = RemoveWarn;
