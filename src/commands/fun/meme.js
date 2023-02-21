const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require("discord.js");
const axios = require('axios');

class Meme extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "meme",
            description: "Sendet zufällig gewählte Memes",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        return await this.sendMeme(interaction.member);
    }

    async sendMeme(member){
        const self = this;

        let memes = (await axios.get('https://www.reddit.com/r/ich_iel/top.json?sort=top&t=day&limit=1000', {
            validateStatus: false
        })).data.data.children;
        memes = [...this.client.utils.shuffleArray(memes)];

        const reloadId = member.user.id + "_reload";
        const reloadButton = this.client.createButton(reloadId, "Neu laden", "Secondary", this.client.emotes.loading, false, null);

        function generateMemeEmbed(){
            const meme = memes[Math.floor(Math.random() * memes.length)];
            const memeEmbed = self.client.generateEmbed("", "", "normal", );
            memeEmbed.setImage(meme.data.url);
            memeEmbed.setTitle(meme.data.title);
            memeEmbed.setFooter({ text: "👍 " + meme.data.ups + " | 👎 " + meme.data.downs });
            return memeEmbed;
        }

        const memeMessage = await this.interaction.followUp({
            embeds: [generateMemeEmbed()],
            components: [
                this.client.createComponentsRow(reloadButton)
            ]
        });

        const collector = memeMessage.createMessageComponentCollector({ filter: ({user}) => user.id === member.user.id });

        collector.on('collect', async (interaction) => {
            await interaction.update({
                embeds: [await generateMemeEmbed()],
                components: [
                   this.client.createComponentsRow(reloadButton)
                ],
            });
        });
    }
}
module.exports = Meme;
