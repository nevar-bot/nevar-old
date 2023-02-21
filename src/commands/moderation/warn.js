const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');

class Warn extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "warn",
            description: "Verwarnt ein Mitglied",

            memberPermissions: ["KickMembers"],
            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addUserOption(option => option
                        .setName("mitglied")
                        .setDescription("Wähle ein Mitglied, welches du verwarnen möchtest")
                        .setRequired(true)
                    )
                    .addStringOption(option => option
                        .setName("grund")
                        .setDescription("Gib ggf. einen Grund an")
                        .setRequired(false)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.warnMember(interaction.options.getUser("mitglied"), interaction.options.getString("grund"));
    }

    async warnMember(user, reason) {
        if(!reason) reason = "Kein Grund angegeben";
        const member = await this.interaction.guild.resolveMember(user.id);
        if(!member){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst ein Mitglied angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }
        if(member.user.id === this.client.user.id) {
            const invalidOptionsEmbed = this.client.generateEmbed("Ich kann mich nicht selber verwarnen.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }
        if(member.user.id === this.client.user.id){
            const invalidOptionsEmbed = this.client.generateEmbed("Du kannst dich nicht selber verwarnen.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }
        if(member.roles.highest.position >= this.interaction.member.roles.highest.position){
            const higherRoleEmbed = this.client.generateEmbed("Du kannst keine Mitglieder verwarnen, die eine höhere Rolle haben als du.", "error", "error");
            return this.interaction.followUp({ embeds: [higherRoleEmbed] });
        }

        const victimData = await this.client.findOrCreateMember({ id: member.user.id, guildID: this.interaction.guild.id });

        victimData.warnings.count++;
        victimData.warnings.list.push({
            date: Date.now(),
            moderator: this.interaction.member.user.tag,
            reason: reason
        });
        victimData.markModified("warnings");
        await victimData.save();

        const privateText =
            " Du wurdest auf " + this.interaction.guild.name + " verwarnt.\n\n" +
            this.client.emotes.arrow + " Grund: " + reason + "\n" +
            this.client.emotes.arrow + " Moderator: " + this.interaction.member.user.tag
        const privateEmbed = this.client.generateEmbed(privateText, "ban", "warning");
        await member.user.send({ embeds:[privateEmbed] }).catch(() => {});

        const publicText =
            " " + member.user.tag + " wurde verwarnt.\n\n" +
            this.client.emotes.arrow + " Grund: " + reason + "\n" +
            this.client.emotes.arrow + " Moderator: " + this.interaction.member.user.tag
        const publicEmbed = this.client.generateEmbed(publicText, "ban", "success");
        return this.interaction.followUp({ embeds: [publicEmbed] });
    }
}
module.exports = Warn;
