const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

class Pride extends BaseCommand {
    constructor(client){
        super(client, {
            name: "pride",
            description: "Sendet einen Avatar mit Pride-Filter",

            cooldown: 1000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addUserOption(option => option
                            .setName("nutzer")
                            .setDescription("Wähle ein Mitglied")
                            .setRequired(false)
                        )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data){
        this.interaction = interaction;

        let user = interaction.member.user;
        if(interaction.options.getUser("nutzer")) user = interaction.options.getUser("nutzer");

        return await this.getPrideAvatar(user);
    }

    async getPrideAvatar(user){
        const prideUrl = "https://some-random-api.ml/canvas/gay?avatar=" + user.displayAvatarURL({ dynamic: true, size: 4096, extension: "png" });
        const prideAvatarEmbed = this.client.createEmbed("", "", "normal");
        prideAvatarEmbed.setTitle("Pride-Avatar von " + user.tag);
        prideAvatarEmbed.setImage(prideUrl);
        return this.interaction.followUp({ embeds: [prideAvatarEmbed] });
    }
}

module.exports = Pride;
