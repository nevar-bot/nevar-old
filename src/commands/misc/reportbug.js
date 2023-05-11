const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder} = require('discord.js');
const moment = require('moment');

class Reportbug extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "reportbug",
            description: "Meldet einen Fehler ans Entwickler-Team",

            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                        .addStringOption(option => option
                            .setName("beschreibung")
                            .setDescription("Beschreibe den Fehler")
                            .setRequired(true)
                        )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data){
        this.interaction = interaction;

        await this.reportBug(this.interaction.options.getString("beschreibung"));
    }

    async reportBug(bug){
        const date = moment(Date.now()).format("DD.MM.YYYY, HH:mm");
        const supportGuild = this.client.guilds.cache.get(this.client.config.support["ID"]);

        const successEmbed = this.client.createEmbed("{0} Danke für deine Meldung! Wir werden uns so schnell wie möglich darum kümmern.", null, "success", this.client.emotes.flags.BugHunterLevel1);
        successEmbed.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true, size: 512 }));
        await this.interaction.followUp({ embeds: [successEmbed] });

        const supportEmbed = this.client.createEmbed("{0} ({1}) hat einen Fehler gemeldet: {2}", "information", "warning", this.interaction.user.tag, this.interaction.user.id, bug);
        supportEmbed.setFooter({ text: "Server-ID: " + this.interaction.guild.id + " | " + date });

        const errorLogChannel = await supportGuild.channels.fetch(this.client.config.support["ERROR_LOG"]);
        if(!errorLogChannel) return;

        return errorLogChannel.send({ embeds: [supportEmbed] });
    }
}

module.exports = Reportbug;
