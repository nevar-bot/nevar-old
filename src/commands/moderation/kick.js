const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');

class Kick extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "kick",
            description: "Kickt ein Mitglied vom Server",

            memberPermissions: ["KickMembers"],
            botPermissions: ["KickMembers"],
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

        await this.kick(interaction.options.getMember("mitglied"), interaction.options.getString("grund"));
    }

    async kick(member, reason) {
        if(member.user.id === this.interaction.member.user.id){
            const cantKickYourselfEmbed = this.client.createEmbed("Du kannst dich nicht selber kicken.", "error", "error");
            return this.interaction.followUp({ embeds: [cantKickYourselfEmbed] });
        }
        if(member.user.id === this.client.user.id){
            const cantKickBotEmbed = this.client.createEmbed("Ich kann mich nicht selber kicken.", "error", "error");
            return this.interaction.followUp({ embeds: [cantKickBotEmbed] });
        }
        if(!member.kickable){
            const cantKickEmbed = this.client.createEmbed("Ich kann {0} nicht kicken.", "error", "error", member.user.tag);
            return this.interaction.followUp({ embeds: [cantKickEmbed] });
        }
        if(member.roles.highest.position >= this.interaction.member.roles.highest.position){
            const higherRoleEmbed = this.client.createEmbed("Du kannst keine Mitglieder kicken, die eine höhere Rolle haben als du.", "error", "error");
            return this.interaction.followUp({ embeds: [higherRoleEmbed] });
        }
        if(!reason) reason = "Kein Grund angegeben";

        member.kick("Gekickt von " + this.interaction.member.user.tag + " - Grund: " + reason)
            .then(async () => {
                const privateText =
                    " Du wurdest von " + this.interaction.guild.name + " gekickt.\n\n" +
                    this.client.emotes.arrow + " Grund: " + reason + "\n" +
                    this.client.emotes.arrow + " Moderator: " + this.interaction.member.user.tag;
                const privateEmbed = this.client.createEmbed(privateText, "leave", "error");
                await member.send({ embeds: [privateEmbed] }).catch(() => {});

                const logText =
                    " **" + member.user.tag + " wurde gekickt**\n\n" +
                    this.client.emotes.user + " Moderator: " + this.interaction.member.user.tag + "\n" +
                    this.client.emotes.text + " Grund: " + reason;
                await this.interaction.guild.logAction(logText, "moderation", this.client.emotes.events.member.ban, "normal", member.user.displayAvatarURL({ dynamic: true }));

                const publicText =
                    " " + member.user.tag + " wurde gekickt.\n\n" +
                    this.client.emotes.arrow + " Grund: " + reason + "\n" +
                    this.client.emotes.arrow + " Moderator: " + this.interaction.member.user.tag;
                const publicEmbed = this.client.createEmbed(publicText, "leave", "error");
                return this.interaction.followUp({ embeds: [publicEmbed] });
            })
            .catch(async () => {
                const errorEmbed = this.client.createEmbed("Ich konnte {0} nicht kicken.", "error", "error", member.user.tag);
                return this.interaction.followUp({ embeds: [errorEmbed] });
            });
    }
}

module.exports = Kick;
