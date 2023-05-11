const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');

class Autorole extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "autorole",
            description: "Vergibt beim Beitritt eines Nutzers automatisch festgelegte Rollen",

            memberPermissions: ["ManageGuild"],
            botPermissions: ["ManageRoles"],

            cooldown: 1000,
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
                    .addRoleOption(option => option
                        .setName("rolle")
                        .setDescription("Wähle eine Rolle")
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
            case "add":
                await this.addAutorole(interaction.options.getRole("rolle"), data);
                break;
            case "remove":
                await this.removeAutorole(interaction.options.getRole("rolle"), data);
                break;
            case "list":
                await this.showList(data);
                break;
            default:
                const unexpectedErrorEmbed = this.client.createEmbed("Ein unerwarteter Fehler ist aufgetreten.", "error", "error");
                return this.interaction.followUp({ embeds: [unexpectedErrorEmbed] });
        }
    }

    async addAutorole(role, data) {
        // Invalid options
        if(!role || !role.id){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst eine Rolle angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        // Role is @everyone
        if(role.id === this.interaction.guild.roles.everyone.id){
            const everyoneEmbed = this.client.createEmbed("Die @everyone Rolle kann nicht als eine Autorolle hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [everyoneEmbed] });
        }

        // Role is managed by an integration
        if(role.managed){
            const roleIsManagedEmbed = this.client.createEmbed("Rollen welche durch eine Integration verwaltet werden, können nicht als Autorolle hinzugefügt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [roleIsManagedEmbed] });
        }

        // Role is higher than the bot's highest role
        if(this.interaction.guild.members.me.roles.highest.position <= role.position){
            const roleIsTooHighEmbed = this.client.createEmbed("Da {0} eine höhere oder gleiche Position wie meine höchste Rolle ({1}) hat, kann sie nicht als Autorolle hinzugefügt werden.", "error", "error", role, this.interaction.guild.members.me.roles.highest);
            return this.interaction.followUp({ embeds: [roleIsTooHighEmbed] });
        }

        // Role is already an autorole
        if(data.guild.settings.welcome.autoroles.includes(role.id)){
            const isAlreadyAutoroleEmbed = this.client.createEmbed("{0} ist bereits eine Autorolle.", "error", "error", role);
            return this.interaction.followUp({ embeds: [isAlreadyAutoroleEmbed] });
        }

        // Save to database
        data.guild.settings.welcome.autoroles.push(role.id);
        data.guild.markModified("settings.welcome");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("{0} wurde als Autorolle hinzugefügt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async removeAutorole(role, data){
        // Invalid options
        if(!role || !role.id){
            const invalidOptionsEmbed = this.client.createEmbed("Du musst eine Rolle angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        // Role is not an autorole
        if(!data.guild.settings.welcome.autoroles.includes(role.id)){
            const isNoAutoroleEmbed = this.client.createEmbed("{0} ist keine Autorolle.", "error", "error", role);
            return this.interaction.followUp({ embeds: [isNoAutoroleEmbed] });
        }

        // Remove from database
        data.guild.settings.welcome.autoroles = data.guild.settings.welcome.autoroles.filter(r => r !== role.id);
        data.guild.markModified("settings.welcome");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("{0} wurde als Autorolle entfernt.", "success", "success", role);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async showList(data){
        let response = data.guild.settings.welcome.autoroles;
        const roleNamesArray = [];

        for(let i = 0; i < response.length; i++){
            const cachedRole = this.interaction.guild.roles.cache.get(response[i]);
            if(!cachedRole){
                response.splice(i, 1);
            }else{
                roleNamesArray.push("**" + cachedRole.name + "**");
            }
        }
        if(data.guild.settings.welcome.autoroles !== response){
            data.guild.settings.welcome.autoroles = response;
            data.guild.markModified("settings.welcome");
            await data.guild.save();
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, roleNamesArray, "Autorollen", "Es sind keine Autorollen vorhanden", "ping");
    }
}

module.exports = Autorole;