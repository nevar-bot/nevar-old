const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const ms = require("enhanced-ms")("de");
const moment = require("moment");

class Reminder extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "reminder",
            description: "Verwaltet deine Erinnerungen",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option => option
                        .setName("aktion")
                        .setDescription("Wähle eine Aktion")
                        .setRequired(true)
                        .addChoices(
                            { name: "erstellen", value: "add" },
                            { name: "löschen", value: "delete" },
                            { name: "liste", value: "list" }
                        )
                    )
                    .addStringOption(option => option
                        .setName("name")
                        .setDescription("Woran soll ich dich erinnern? (beim löschen: Name der Erinnerung)")
                        .setRequired(false)
                        .setMaxLength(500)
                    )
                    .addStringOption(option => option
                        .setName("dauer")
                        .setDescription("Wann soll ich dich erinnern? (z.B. 1h, 1w, 1w, 1h 30m)")
                        .setRequired(false)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        const action = interaction.options.getString('aktion');
        switch(action){
            case "add":
                await this.addReminder(interaction.options.getString("name"), interaction.options.getString("dauer"), data);
                break;
            case "delete":
                await this.deleteReminder(interaction.options.getString("name"), data);
                break;
            case "list":
                await this.listReminders(data);
                break;
        }
    }

    async addReminder(name, dauer, data){
        if(!name || !dauer || !ms(dauer)){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst einen Namen und eine Dauer angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        const reminder = {
            startDate: Date.now(),
            endDate: Date.now() + ms(dauer),
            reason: name,
            channel: this.interaction.channel.id,
        };

        data.member.reminders.push(reminder);
        data.member.markModified("reminders");
        await data.member.save();
        this.client.databaseCache.reminders.set(this.interaction.member.user.id + this.interaction.guild.id, data.member);

        const successEmbed = this.client.generateEmbed("In {0} werde ich dich erinnern.", "success", "success", ms(ms(dauer)));
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async deleteReminder(name, data){
        if(!name){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst einen Namen angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }
        const reminder = data.member.reminders.find(r => r.reason === name);
        if(!reminder){
            const invalidOptionsEmbed = this.client.generateEmbed("Mit dem Namen hab ich keine Erinnerung gefunden.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        data.member.reminders.splice(data.member.reminders.indexOf(reminder), 1);
        data.member.markModified("reminders");
        await data.member.save();

        const successEmbed = this.client.generateEmbed("Die Erinnerung wurde gelöscht.", "success", "success");
        return this.interaction.followUp({ embeds: [successEmbed] });
    }

    async listReminders(data){
        const reminders = [];
        for(let reminder of data.member.reminders){
            const text =
                " **" + reminder.reason + "**\n" +
                this.client.emotes.arrow + " Erstellt am: " + moment(reminder.startDate).format("DD.MM.YYYY, HH:mm") + "\n" +
                this.client.emotes.arrow + " Endet am: " + moment(reminder.endDate).format("DD.MM.YYYY, HH:mm") + "\n" +
                this.client.emotes.arrow + " Endet in: " + this.client.utils.getRelativeTime(Date.now() - (reminder.endDate - Date.now()));
            reminders.push(text);
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, reminders, "Erinnerungen", "Du hast keine Erinnerungen erstellt", "reminder");
    }
}
module.exports = Reminder;
