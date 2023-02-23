const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require("discord.js");

class Clear extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "clear",
            description: "Löscht eine bestimmte Anzahl an Nachrichten, ggf. von einem bestimmten Nutzer",

            memberPermissions: ["ManageMessages"],
            botPermissions: ["ManageMessages"],

            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                        .addIntegerOption(option => option
                            .setName("anzahl")
                            .setDescription("Gib an, wieviele Nachrichten du löschen möchtest")
                            .setMinValue(1)
                            .setMaxValue(99)
                            .setRequired(true)
                        )
                        .addUserOption(option => option
                            .setName("nutzer")
                            .setDescription("Wähle, von welchem Nutzer du Nachrichten löschen möchtest")
                            .setRequired(false)
                        )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.clearMessages(interaction.options.getInteger("anzahl"), interaction.options.getUser("nutzer"));

        return;
    }

    async clearMessages(amount, user){
        let messages = Array.from((await this.interaction.channel.messages.fetch({ limit: amount + 1 })).values());

        if (user){
            messages = messages.filter((m) => m.author.id === user.id);
        }
        messages = messages.filter((m) => !m.pinned);

        if(messages[0].author.id === this.client.user.id) messages.shift();

        this.interaction.channel.bulkDelete(messages, true).catch(() => {});

        const string = user ? "von " + user.tag : "";
        const deletedEmbed = this.client.generateEmbed("Ich habe {0} Nachrichten {1} gelöscht.", "success", "success", messages.length, string);
        const embedSent = await this.interaction.followUp({ embeds: [deletedEmbed] });

        const logText =
            " **Nachrichten gelöscht**\n\n" +
            this.client.emotes.arrow + " Moderator: " + this.interaction.user.tag + "\n" +
            this.client.emotes.arrow + " Anzahl: " + messages.length;
        await this.interaction.guild.logAction(logText, "moderation", this.client.emotes.delete, "normal", this.interaction.user.displayAvatarURL({ dynamic: true }));

        await this.client.wait(7000);
        embedSent.delete().catch(() => {});

    }
}

module.exports = Clear;
