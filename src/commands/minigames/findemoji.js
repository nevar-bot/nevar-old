const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, ActionRowBuilder} = require('discord.js');

class Findemoji extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "findemoji",
            description: "Startet eine Runde Find the emoji für dich",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    static interaction;

    async dispatch(interaction, data){
        this.interaction = interaction;
        await this.startGame();
    }

    async startGame(){
        const game = new FindemojiGame({
            interaction: this.interaction,
            client: this.client
        });
        await game.startGame();
    }
}

module.exports = Findemoji;

class FindemojiGame {
    constructor(options = {}) {

        options.emojis = ['🍉', '🍇', '🍊', '🍋', '🥭', '🍎', '🍏', '🥝', '🥥', '🍓', '🍒'];

        this.client = options.client;
        this.options = options;
        this.interaction = options.interaction;
        this.emojis = options.emojis;
        this.selected = null;
        this.emoji = null;
    }


    async sendMessage(content) {
        return await this.interaction.editReply(content);
    }


    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    disableButtons(components) {
        for (let x = 0; x < components.length; x++) {
            for (let y = 0; y < components[x].components.length; y++) {
                components[x].components[y].data.disabled = true;
            }
        }
        return components;
    }

    async startGame() {
        await this.interaction.deferReply().catch(e => {});

        this.emojis = this.shuffleArray(this.emojis).slice(0, 8);
        this.emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];


        const findEmojiEmbed = this.client.generateEmbed("Du hast 5 Sekunden, um dir die Emojis in richtiger Reihenfolge zu merken!", "arrow", "normal");
        findEmojiEmbed.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }));

        const msg = await this.sendMessage({ embeds: [findEmojiEmbed], components: this.getComponents(true) });


        setTimeout(async () => {
            findEmojiEmbed.setDescription("Finde den " + this.emoji + " Emoji, bevor die Zeit abläuft");
            await msg.edit({ embeds: [findEmojiEmbed], components: this.getComponents(false) });
            const emojiCollector = msg.createMessageComponentCollector({ filter: btn => btn.user.id === this.interaction.user.id, idle: 30000 });


            emojiCollector.on('collect', async (btn) => {
                await btn.deferUpdate().catch(e => {});
                this.selected = this.emojis[parseInt(btn.customId.split('_')[1])];
                return emojiCollector.stop();
            })


            emojiCollector.on('end', async (_, reason) => {
                if (reason === 'idle' || reason === 'user') return this.gameOver(msg, (reason === 'user'));
            })
        }, 5000);
    }


    gameOver(msg, result) {
        const resultMessage = (this.selected === this.emoji) ? 'win' : 'lose';
        if (!result) this.selected = this.emoji;

        let string;
        if(resultMessage === "win"){
            string = "Du hast den richtigen Emoji ausgewählt. {0}";
        }else{
            string = "Du hast den falschen Emoji ausgewählt. {0}";
        }

        const gameOverEmbed = this.client.generateEmbed(string, "arrow", "normal", this.emoji);
        gameOverEmbed.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }));

        return msg.edit({ embeds: [gameOverEmbed], components: this.disableButtons(this.getComponents(true)) });
    }


    getComponents(showEmoji) {
        const components = [];
        for (let x = 0; x < 2; x++) {
            const row = new ActionRowBuilder();
            for (let y = 0; y < 4; y++) {
                const buttonEmoji = this.emojis[x * 4 + y];

                const btn = this.client.createButton("findEmoji_" + (x*4 + y), "\u200b", (buttonEmoji === this.selected ? (this.selected === this.emoji ? 'Success' : 'Danger') : "Primary"), (showEmoji ? buttonEmoji : null));
                row.addComponents(btn);
            }
            components.push(row);
        }
        return components;
    }
}