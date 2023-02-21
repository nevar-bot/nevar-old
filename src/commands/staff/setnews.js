const Command = require('../../structures/BaseCommand');
const fs = require('fs');
const { EmbedBuilder, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require("discord.js");

class Setnews extends Command {
    constructor(client){
        super(client, {
            name: "setnews",
            description: "staff/setnews:general:description",
            cooldown: 3000,
            staffOnly: true,
            dirname: __dirname,
            slashCommand: {
                addCommand: false,
                data: new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, args, data){
        const { guild, member, channel, user } = interaction;
        const id = user.id;

        let key = this.client.randomKey(10);
        const messageModal = new ModalBuilder()
            .setCustomId(id + '_message_modal' + '_' + key)
            .setTitle(guild.translate("staff/setnews:main:modal:title"));

        const textInput = new TextInputBuilder()
            .setCustomId('text')
            .setLabel(guild.translate("staff/setnews:main:modal:labels:text"))
            .setStyle(TextInputStyle.Paragraph);

        let firstModalRow = new ActionRowBuilder().addComponents(textInput);
        messageModal.addComponents(firstModalRow);
        await interaction.showModal(messageModal);
        const submitted = await interaction.awaitModalSubmit({
            time: 600000,
            filter: i => i.user.id = user.id
        }).catch(() => {});

        if (submitted) {
            if (submitted.customId !== id + '_message_modal' + '_' + key) return;
            let news = submitted.fields.getTextInputValue('text');

            let json = {
                timestamp: Date.now(),
                text: news
            };

            fs.writeFileSync('./storage/news.json', JSON.stringify(json, null, 4));

            let embed = new EmbedBuilder()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("staff/setnews:main:updated")
                    .replace('{emotes.success}', this.client.emotes.success))
                .setColor(this.client.embedColor)
                .setFooter({text: this.client.footer});
            await submitted.deferReply();
            let sent = await submitted.followUp({embeds: [embed],});
        }
    }
}

module.exports = Setnews;
