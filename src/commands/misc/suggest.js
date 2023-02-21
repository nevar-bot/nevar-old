const Command = require('../../structures/BaseCommand');
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

class Suggest extends Command {
    constructor(client) {
        super(client, {
            name: "suggest",
            description: "misc/suggest:general:description",
            cooldown: 3000,
            dirname: __dirname,
            slashCommand: {
                addCommand: false,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option =>
                            option.setRequired(true))
            }
        });
    }

    async run(interaction, args, data) {
        const {guild, member, channel, user} = interaction;

        if(data.guild.plugins?.suggestionSystem?.enabled){
            let embed = new EmbedBuilder()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setColor(this.client.embedColor)
                .setDescription(guild.translate("misc/suggest:main:success")
                    .replaceAll('{emotes.success}', this.client.emotes.success))
                .setFooter({text: this.client.footer});
            await interaction.send(embed);
            return new(require('../../events/interaction/seperations/MemberSubmitsSuggestion'))(this.client).run(interaction, data, guild, args.join(' '));
        }else{
            let embed = new EmbedBuilder()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setColor(this.client.embedColor)
                .setDescription(guild.translate("misc/suggest:main:error")
                    .replaceAll('{emotes.error}', this.client.emotes.error))
                .setFooter({text: this.client.footer});
            return interaction.send(embed);
        }

    }

}
module.exports = Suggest;