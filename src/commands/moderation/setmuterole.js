const BaseCommand = require('@structures/BaseCommand');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Resolver ="test";


class Setmuterole extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "setmuterole",
            description: "Definiert, welche Rolle bei einem Mute vergeben wird",

            memberPermissions: ["KickMembers"],
            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                        .addRoleOption(option => option
                            .setName("rolle")
                            .setDescription("Wähle eine Rolle")
                            .setRequired(true)
                        )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.setMuteRole(interaction.options.getRole("rolle"), data);
    }

    async setMuteRole(role, data){
        // Invalid options
        if(!role || !role.id){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst eine Rolle angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        // Role is @everyone
        if(role.id === this.interaction.guild.roles.everyone.id){
            const everyoneEmbed = this.client.createEmbed("Die @everyone Rolle kann nicht als Mute-Rolle gesetzt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [everyoneEmbed] });
        }

        // Role is managed by an integration
        if(role.managed){
            const roleIsManagedEmbed = this.client.createEmbed("Rollen welche durch eine Integration verwaltet werden, können nicht als Mute-Rolle gesetzt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
        }

        // Role is higher than the bot's highest role
        if(this.interaction.guild.members.me.roles.highest.position <= role.position){
            const roleIsTooHighEmbed = this.client.createEmbed("Da {0} eine höhere oder gleiche Position wie meine höchste Rolle ({1}) hat, kann sie nicht als Mute-Rolle gesetzt werden.", "error", "error", role, this.interaction.guild.members.me.roles.highest);
            return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
        }

        // Role is already the mute role
        if(data.guild.settings.muterole === role.id){
            const roleIsAlreadyMuteRoleEmbed = this.client.createEmbed("{0} ist bereits die Mute-Rolle.", "error", "error", role);
            return this.interaction.followUp({ embeds: [roleIsAlreadyMuteRoleEmbed] });
        }

        // Save to database
        data.guild.settings.muterole = role.id;
        data.guild.markModified("settings.muterole");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("{0} wurde als Mute-Rolle gesetzt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }
}

module.exports = Setmuterole;
