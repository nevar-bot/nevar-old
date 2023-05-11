const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, ChannelType } = require('discord.js');

class Welcome extends BaseCommand {
    constructor(client){
        super(client, {
            name: "welcome",
            description: "Stellt die Willkommensnachricht ein",

            memberPermissions: ["ManageGuild"],
            cooldown: 2000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addSubcommand(subcommand => subcommand
                        .setName("status")
                        .setDescription("Legt fest, ob die Willkommensnachricht aktiviert oder deaktiviert ist")
                        .addStringOption(option => option
                            .setName("status")
                            .setDescription("Wähle einen Status")
                            .setRequired(true)
                            .addChoices(
                                { name: "an", value: "true" },
                                { name: "aus", value: "false" }
                            )
                        )
                    )
                    .addSubcommand(subcommand => subcommand
                        .setName("test")
                        .setDescription("Sendet eine Testnachricht")
                    )
                    .addSubcommand(subcommand => subcommand
                        .setName("channel")
                        .setDescription("Legt fest, in welchem Channel die Willkommensnachricht gesendet wird")
                        .addChannelOption(option => option
                            .setName("channel")
                            .setRequired(true)
                            .setDescription("Wähle einen Channel")
                            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
                        )
                    )
                    .addSubcommand(subcommand => subcommand
                        .setName("typ")
                        .setDescription("Ob die Willkommensnachricht als Embed oder als Text gesendet wird")
                        .addStringOption(option => option
                            .setName("typ")
                            .setDescription("Wähle einen Typ")
                            .setRequired(true)
                            .addChoices(
                                { name: "embed", value: "embed" },
                                { name: "text", value: "text" }
                            )
                        )
                    )
                    .addSubcommand(subcommand => subcommand
                        .setName("nachricht")
                        .setDescription("Definiert die Willkommensnachricht (Variablen siehe /welcome variablen)")
                        .addStringOption(option => option
                            .setName("nachricht")
                            .setDescription("Gib die Nachricht ein")
                            .setRequired(true)
                        )
                    )
                    .addSubcommand(subcommand => subcommand
                        .setName("variablen")
                        .setDescription("Listet alle Variablen, die in der Willkommensnachricht verwendet werden können")
                    )

            }
        })
    }

    static interaction;

    async dispatch(interaction, data){
        this.interaction = interaction;

        const subcommand = interaction.options.getSubcommand();

        switch(subcommand){
            case "status":
                await this.setStatus(interaction.options.getString("status"), data);
                break;
            case "test":
                await this.sendPreview(data);
                break;
            case "channel":
                await this.setChannel(interaction.options.getChannel("channel"), data);
                break;
            case "typ":
                await this.setType(interaction.options.getString("typ"), data);
                break;
            case "nachricht":
                await this.setMessage(interaction.options.getString("nachricht"), data);
                break;
            case "variablen":
                await this.showVariables();
                break;
        }
    }

    async setStatus(status, data){
        if(data.guild.settings.welcome.enabled === JSON.parse(status)){
            const string = JSON.parse(status) ? "aktiviert" : "deaktiviert";
            const isAlreadyEmbed = this.client.createEmbed("Die Willkommensnachricht ist bereits {0}.", "error", "error", string);
            return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
        }

        data.guild.settings.welcome.enabled = JSON.parse(status);
        data.guild.markModified("settings.welcome.enabled");
        await data.guild.save();

        const string = JSON.parse(status) ? "aktiviert" : "deaktiviert";
        const successEmbed = this.client.createEmbed("Die Willkommensnachricht wurde {0}.", "success", "success", string);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async sendPreview(data){
        if(!data.guild.settings.welcome.enabled){
            const notEnabledEmbed = this.client.createEmbed("Die Willkommensnachricht ist nicht aktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [notEnabledEmbed] });
        }
        if(!data.guild.settings.welcome.channel || !this.client.channels.cache.get(data.guild.settings.welcome.channel)){
            const noChannelEmbed = this.client.createEmbed("Es wurde kein Channel für die Willkommensnachricht festgelegt.", "error", "error");
            return this.interaction.followUp({ embeds: [noChannelEmbed] });
        }
        if(!data.guild.settings.welcome.message){
            const noMessageEmbed = this.client.createEmbed("Es wurde keine Nachricht für die Willkommensnachricht festgelegt.", "error", "error");
            return this.interaction.followUp({ embeds: [noMessageEmbed] });
        }
        if(!data.guild.settings.welcome.type){
            const noTypeEmbed = this.client.createEmbed("Es wurde kein Typ für die Willkommensnachricht festgelegt.", "error", "error");
            return this.interaction.followUp({ embeds: [noTypeEmbed] });
        }

        const member = this.interaction.member;
        const self = this;
        function parseMessage(str){
            return str
                .replaceAll(/{user}/g, member)
                .replaceAll(/{user:username}/g, member.user.username)
                .replaceAll(/{user:tag}/g, member.user.tag)
                .replaceAll(/{user:discriminator}/g, member.user.discriminator)
                .replaceAll(/{user:id}/g, member.user.id)
                .replaceAll(/{server:name}/g, self.interaction.guild.name)
                .replaceAll(/{server:id}/g, self.interaction.guild.id)
                .replaceAll(/{server:membercount}/g, self.interaction.guild.memberCount)
        }

        const channel = this.client.channels.cache.get(data.guild.settings.welcome.channel);
        const message = parseMessage(data.guild.settings.welcome.message);

        if(data.guild.settings.welcome.type === "embed"){
            const previewEmbed = this.client.createEmbed("{0}", null, "normal", message);
            previewEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
            await channel.send({ embeds: [previewEmbed] }).catch(() => {});
        }else if(data.guild.settings.welcome.type === "text"){
            await channel.send({ content: message }).catch(() => {});
        }

        const testExecutedEmbed = this.client.createEmbed("Die Willkommensnachricht wurde getestet", "success", "success");
        return this.interaction.followUp({ embeds: [testExecutedEmbed] });
    }

    async setChannel(channel, data){
        if(!data.guild.settings.welcome.enabled){
            const notEnabledEmbed = this.client.createEmbed("Die Willkommensnachricht ist nicht aktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [notEnabledEmbed] });
        }

        data.guild.settings.welcome.channel = channel.id;
        data.guild.markModified("settings.welcome.channel");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("Die Willkommensnachricht wird ab jetzt in {0} gesendet.", "success", "success", channel.toString());
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async setType(type, data){
        if(!data.guild.settings.welcome.enabled){
            const notEnabledEmbed = this.client.createEmbed("Die Willkommensnachricht ist nicht aktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [notEnabledEmbed] });
        }

        if(data.guild.settings.welcome.type === type){
            const string = type === "embed" ? "Embed" : "Textnachricht";
            const isAlreadyEmbed = this.client.createEmbed("Die Willkommensnachricht wird bereits als {0} gesendet.", "error", "error", string);
            return this.interaction.followUp({ embeds: [isAlreadyEmbed] });
        }

        data.guild.settings.welcome.type = type;
        data.guild.markModified("settings.welcome.type");
        await data.guild.save();

        const string = type === "embed" ? "Embed" : "Textnachricht";
        const successEmbed = this.client.createEmbed("Die Willkommensnachricht wird ab jetzt als {0} gesendet.", "success", "success", string);
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async setMessage(message, data){
        if(!data.guild.settings.welcome.enabled){
            const notEnabledEmbed = this.client.createEmbed("Die Willkommensnachricht ist nicht aktiviert.", "error", "error");
            return this.interaction.followUp({ embeds: [notEnabledEmbed] });
        }

        data.guild.settings.welcome.message = message;
        data.guild.markModified("settings.welcome.message");
        await data.guild.save();

        const successEmbed = this.client.createEmbed("Die Willkommensnachricht wurde geändert.", "success", "success");
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async showVariables(){
        const variables = [
            "**{user}** - Erwähnt das Mitglied",
            "**{user:username}** - Der Name des Mitglieds",
            "**{user:tag}** - Der volle Name des Mitglieds mit Discriminator",
            "**{user:discriminator}** - Der Discriminator des Mitglieds",
            "**{user:id}** - ID des Mitglieds",
            "**{server:name}** - Name des Servers",
            "**{server:id}** - ID des Servers",
            "**{server:membercount}** - Anzahl an Mitgliedern des Servers"
        ];
        await this.client.utils.sendPaginatedEmbed(this.interaction, 10, variables, "Verfügbare Variablen", "Es sind keine Variablen verfügbar", "shine");

    }
}

module.exports = Welcome;