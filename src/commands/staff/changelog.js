const BaseCommand = require('@structures/BaseCommand');
const { ActionRowBuilder,  ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const moment = require('moment');

class Changelog extends BaseCommand {
    constructor(client){
        super(client, {
            name: "changelog",
            description: "Sendet den Changelog als übersichtliche Nachricht",

            cooldown: 3000,
            ownerOnly: true,
            dirname: __dirname,

            slashCommand: {
                addCommand: false
            }
        });
    }

    static message;
    async dispatch(message, args, data){
        this.message = message;
        await this.sendChangelog();
    }

    async sendChangelog(){
        const createButton = this.client.createButton("create", "Changelog erstellen", "Secondary", "text");
        const createEmbed = this.client.createEmbed("Wenn du einen Changelog erstellen möchtest, drücke den Button", "arrow", "normal");
        const buttonRow = this.client.createMessageComponentsRow(createButton);

        const embedMessage = await this.message.reply({ embeds: [createEmbed], components: [buttonRow] });

        const buttonCollector = embedMessage.createMessageComponentCollector({ filter: (i) => i.user.id === this.message.author.id });
        buttonCollector.on("collect", async (interaction) => {
            // Create changelog modal
            const modal = new ModalBuilder()
                .setCustomId("changelog")
                .setTitle("Changelog erstellen");

            const newInput = new TextInputBuilder()
                .setCustomId("new")
                .setLabel("Neue Funktionen")
                .setRequired(false)
                .setStyle(TextInputStyle.Paragraph);

            const improvedInput = new TextInputBuilder()
                .setCustomId("improved")
                .setLabel("Verbesserte Funktionen")
                .setRequired(false)
                .setStyle(TextInputStyle.Paragraph);

            const fixedInput = new TextInputBuilder()
                .setCustomId("fixed")
                .setLabel("Gefixte Bugs")
                .setRequired(false)
                .setStyle(TextInputStyle.Paragraph);

            const removedInput = new TextInputBuilder()
                .setCustomId("removed")
                .setLabel("Entfernte Funktionen")
                .setRequired(false)
                .setStyle(TextInputStyle.Paragraph);


            const newActionRow = new ActionRowBuilder().addComponents(newInput);
            const fixedActionRow = new ActionRowBuilder().addComponents(fixedInput);
            const improvedActionRow = new ActionRowBuilder().addComponents(improvedInput);
            const removedActionRow = new ActionRowBuilder().addComponents(removedInput);
            await modal.addComponents(newActionRow, fixedActionRow, improvedActionRow, removedActionRow);

            await interaction.showModal(modal);
            interaction.awaitModalSubmit({ filter: (int) => int.user.id === this.message.author.id, time: 10 * 60 * 1000 })
                .then(async (int) => {
                    let newFeatures = int.fields.getTextInputValue("new");
                    let improvedFeatures = int.fields.getTextInputValue("improved");
                    let fixedFeatures = int.fields.getTextInputValue("fixed");
                    let removedFeatures = int.fields.getTextInputValue("removed");

                    if (newFeatures === '') newFeatures = '/';
                    newFeatures = newFeatures.split(/\r?\n/);

                    if (improvedFeatures === '') improvedFeatures = '/';
                    improvedFeatures = improvedFeatures.split(/\r?\n/);

                    if (fixedFeatures === '') fixedFeatures = '/';
                    fixedFeatures = fixedFeatures.split(/\r?\n/);

                    if (removedFeatures === '') removedFeatures = '/';
                    removedFeatures = removedFeatures.split(/\r?\n/);

                    const date = moment(Date.now()).format("DD.MM.YYYY, HH:mm");

                    const text =
                        this.client.emotes.shine + " **NEUE FUNKTIONEN**\n" + this.client.emotes.arrow + " " + newFeatures.join("\n" + this.client.emotes.arrow + " ") + "\n\n\n\n" +
                        this.client.emotes.rocket + " **VERBESSERTE FUNKTIONEN**\n" + this.client.emotes.arrow + " " + improvedFeatures.join("\n" + this.client.emotes.arrow + " ") + "\n\n\n\n" +
                        this.client.emotes.bug + " **GEFIXTE BUGS**\n" + this.client.emotes.arrow + " " + fixedFeatures.join("\n" + this.client.emotes.arrow + " ") + "\n\n\n\n" +
                        this.client.emotes.error + " **ENTFERNTE FUNKTIONEN**\n" + this.client.emotes.arrow + " " + removedFeatures.join("\n" + this.client.emotes.arrow + " ") + "\n\n\n\n";

                    const changelogEmbed = this.client.createEmbed("{0}", null, "normal", text);
                    changelogEmbed.setThumbnail(this.client.user.displayAvatarURL());
                    changelogEmbed.setTitle("Changelog vom " + date);
                    this.message.channel.send({ embeds: [changelogEmbed] });

                    // Delete messages and close modal
                    const sentEmbed = await this.client.createEmbed("Der Changelog wurde erstellt und gesendet", "success", "success");
                    await int.update({ embeds: [sentEmbed], components: [] });
                    await this.message.delete().catch(() => {});
                })
        })
    }
}

module.exports = Changelog;
