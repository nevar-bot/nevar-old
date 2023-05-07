const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require("discord.js");
const moment = require("moment-timezone");

class Timestamp extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "timestamp",
            description: "Erstellt einen Discord-Timestamp aus einem Datum",

            cooldown: 1000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option => option
                        .setName("datum")
                        .setDescription("Gib hier das Datum im deutschen Format an (Datum & Zeit, nur Datum oder nur Zeit)")
                        .setRequired(true)
                    )
                    .addStringOption(option => option
                        .setName("format")
                        .setDescription("Wähle, wie der Timestamp angezeigt werden soll")
                        .setRequired(true)
                        .addChoices(
                            {
                                name: "Kurze Zeit (bspw. 17:30)",
                                value: "t"
                            },
                            {
                                name: "Lange Zeit (bspw. 17:30:12)",
                                value: "T"
                            },
                            {
                                name: "Kurzes Datum (bspw. 01.01.2023)",
                                value: "d"
                            },
                            {
                                name: "Langes Datum (bspw. 01. Januar 2023)",
                                value: "D"
                            },
                            {
                                name: "Kurzes Datum und kurze Zeit (bspw. 01.01.2023 17:30)",
                                value: "f"
                            },
                            {
                                name: "Langes Datum und lange Zeit (bspw. 01. Januar 2023 17:30)",
                                value: "F"
                            },
                            {
                                name: "Relative Zeit (bspw. vor 5 Minuten)",
                                value: "R"
                            }
                        )
                    )
            }
        });
    }

    static interaction;

    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.createTimestamp(interaction.options.getString("datum"), interaction.options.getString("format"));
    }

    async createTimestamp(date, type) {
        const unix = this.parseGermanDateTime(date);
        if(!unix){
            const errorEmbed = this.client.generateEmbed("Du hast kein gültiges Datum angegeben! Dieses muss aus einem Datum und einer Uhrzeit, nur einem Datum oder nur einer Uhrzeit bestehen.", "error", "normal");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }
        const timestamp = "<t:" + unix + ":" + type + ">"
        const rawTimestamp = "`<t:" + unix + ":" + type + ">`"
        const timestampEmbed = this.client.generateEmbed("Hier ist dein generierter Zeitstempel:\n{0} {1}\n{2} {3}", "success", "normal", this.client.emotes.calendar, timestamp, this.client.emotes.text, rawTimestamp);

        const custom_id = "timestamp_copy" + Date.now();
        const copyButton = this.client.createButton(custom_id, "Zeitstempel kopieren", "Secondary", this.client.emotes.text, false, null);
        const row = this.client.createComponentsRow(copyButton);
        await this.interaction.followUp({ embeds: [timestampEmbed], components: [row] });

        const filter = i => i.customId === custom_id;
        const collector = this.interaction.channel.createMessageComponentCollector({ filter });
        collector.on("collect", async i => {
            await i.deferUpdate();
            await i.followUp({ content: rawTimestamp, ephemeral: true });
        });
    }

    parseGermanDateTime(inputString) {
        let format = '';

        if(inputString.includes(':')) {
            if(inputString.includes('.')) {
                format = "DD.MM.YYYY HH:mm";
            }else{
                format = "HH:mm";
            }
        }else if(inputString.includes('.')){
            format = "DD.MM.YYYY";
        }

        const parsedDate = moment.tz(inputString, format, 'Europe/Berlin');

        if (parsedDate.isValid()) {
            return parsedDate.unix();
        }

        return null;
    }
}

module.exports = Timestamp;