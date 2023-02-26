const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');

class Unmute extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "unmute",
            description: "Entmutet ein Mitglied",

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

        await this.unmute(interaction.options.getUser("mitglied"), data);
    }

    async unmute(user, data){
        const member = await this.interaction.guild.resolveMember(user.id);
        if(!member){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst ein Mitglied angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        const memberData = await this.client.findOrCreateMember({ id: user.id, guildID: this.interaction.guild.id });
        if(!memberData.muted.state){
            const isNotMutedEmbed = this.client.generateEmbed("{0} ist nicht gemutet.", "error", "error", user.tag);
            return this.interaction.followUp({ embeds: [isNotMutedEmbed] });
        }

        member.roles.remove(data.guild.settings.muterole, "Vorzeitiger Unmute durch " + this.interaction.user.tag).catch(() => {});
        memberData.muted = {
            state: false,
            reason: null,
            moderator: {
                name: null,
                id: null
            },
            duration: null,
            mutedAt: null,
            mutedUntil: null
        }
        memberData.markModified("muted");
        await memberData.save();
        this.client.databaseCache.mutedUsers.delete(user.id + this.interaction.guild.id);

        const logText =
            " **" + user.tag + " wurde entmutet**\n\n" +
            this.client.emotes.user + " Moderator: " + this.interaction.user.tag;
        await this.interaction.guild.logAction(logText, "moderation", this.client.emotes.timeout, "normal", member.user.displayAvatarURL({ dynamic: true }));


        const successEmbed = this.client.generateEmbed("{0} wurde entmutet.", "success", "success", user.tag);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }
}
module.exports = Unmute;
