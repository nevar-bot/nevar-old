const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, ActionRowBuilder} = require('discord.js');

class Hangman extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "hangman",
            description: "Startet eine Runde Hangman für dich",

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
        const game = new HangmanGame({
            interaction: this.interaction,
            client: this.client
        })

        await game.startGame();
    }

}

module.exports = Hangman;


const words = [
    "Auto", "Haus", "Stadt", "Land", "Fluss", "Garten", "Schule", "Bibliothek", "Kino",
    "Museum", "Musik", "Kunst", "Sport", "Urlaub", "Reise", "Natur", "Umwelt", "Gesundheit", "Lebensweise",
    "Kochen", "Backen", "Wein", "Bier", "Alkohol", "Wasser", "Feuer", "Luft", "Erde", "Himmel", "Sonne",
    "Mond", "Sterne", "Kosmos", "Zeit", "Geschichte", "Zukunft", "Wissenschaft", "Technologie", "Innovation",
    "Philosophie", "Religion", "Mythologie", "Fantasie", "Literatur", "Sprache", "Grammatik", "Vokabeln",
    "Film", "Fernsehen", "Serien", "Dokumentation", "Drama", "Action", "Thriller", "Horror", "Romanze", "Animation",
    "Superhelden", "Krieg", "Frieden", "Politik", "Gesellschaft", "Wirtschaft", "Arbeit", "Karriere", "Geld",
    "Bank", "Versicherung", "Handel", "Marketing", "Kunden", "Produktion", "Transport", "Logistik",
    "Internet", "Socialmedia", "Apps", "Spiele", "Onlineshopping", "Mode", "Schmuck", "Kosmetik", "Geschenke",
    "Haustiere", "Tiere", "Pflanzen", "Farben", "Formen"
];
class HangmanGame {
    constructor(options = {}) {
        options.hangman = {
            hat: '🎩',
            head: '😟',
            shirt: '👕',
            pants: '🩳',
            boots: '👞👞'
        }

        options.timeoutTime = 60000;
        options.theme = Object.keys(words)[Math.floor(Math.random() * Object.keys(words).length)];
        options.winMessage = "Du hast gewonnen. Das Wort war **{word}**."
        options.loseMessage = "Du hast leider verloren. Das richtige Wort wäre **{word}** gewesen."

        this.options = options;
        this.client = options.client;
        this.interaction = options.interaction;
        this.hangman = options.hangman;
        this.word = words[Math.floor(Math.random() * words.length)];
        this.buttonPage = 0;
        this.guessed = [];
        this.damage = 0;
    }

    getAlphaEmoji(letter) {
        const letters = {
            'A': '🇦', 'B': '🇧', 'C': '🇨', 'D': '🇩', 'E': '🇪', 'F': '🇫', 'G': '🇬', 'H': '🇭', 'I': '🇮',
            'J': '🇯', 'K': '🇰', 'L': '🇱', 'M': '🇲', 'N': '🇳', 'O': '🇴', 'P': '🇵', 'Q': '🇶', 'R': '🇷',
            'S': '🇸', 'T': '🇹', 'U': '🇺', 'V': '🇻', 'W': '🇼', 'X': '🇽', 'Y': '🇾', 'Z': '🇿',
        }

        if (letter == 0) return Object.keys(letters).slice(0, 12);
        if (letter == 1) return Object.keys(letters).slice(12, 24);
        return letters[letter];
    }

    getBoardContent() {
        let board = '```\n|‾‾‾‾‾‾| \n|      ';
        board += (this.damage > 0 ? this.hangman.hat : ' ')   + ' \n|      ';
        board += (this.damage > 1 ? this.hangman.head : ' ')  + ' \n|      ';
        board += (this.damage > 2 ? this.hangman.shirt : ' ') + ' \n|      ';
        board += (this.damage > 3 ? this.hangman.pants : ' ') + ' \n|     ';
        board += (this.damage > 4 ? this.hangman.boots : ' ') + ' \n|     ';
        board += '\n|__________                      ```';
        return board;
    }


    async sendMessage(content) {
        return await this.interaction.editReply(content);
    }

    async startGame() {
        await this.interaction.deferReply().catch(() => {});

        const description =
            this.getBoardContent() + "\n" +
            this.client.emotes.arrow + " **Wort (" + this.word.length + " Buchstaben)**\n" +
            this.getWordEmojis();
        const hangmanEmbed = this.client.generateEmbed(description, null, "normal");
        hangmanEmbed.setTitle("Hangman");
        hangmanEmbed.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))

        const hangmanMessage = await this.sendMessage({ embeds: [hangmanEmbed], components: this.getComponents() });
        return this.handleButtons(hangmanMessage);
    }


    handleButtons(msg) {
        const hangmanCollector = msg.createMessageComponentCollector({ filter: btn => btn.user.id === this.interaction.user.id });

        hangmanCollector.on('collect', async btn => {
            await btn.deferUpdate().catch(() => {});

            const guess = btn.customId.split('_')[1];
            if(guess === 'stop') return hangmanCollector.stop();
            if(guess == 0 || guess == 1) return msg.edit({ components: this.getComponents(parseInt(guess)) });
            if(this.guessed.includes(guess)) return;
            this.guessed.push(guess);

            if (!this.word.toUpperCase().includes(guess)) this.damage += 1;
            if (this.damage > 4 || this.foundWord()) return hangmanCollector.stop();


            const description =
                this.getBoardContent() + "\n" +
                this.client.emotes.question + " **Geratene Buchstaben**\n" +
                this.client.emotes.arrow + " " + this.guessed.join(", ") + "\n\n" +
                this.client.emotes.arrow + " **Wort (" + this.word.length + " Buchstaben)**\n" +
                this.getWordEmojis();

            const hangmanEmbed = this.client.generateEmbed(description, null, "normal");
            hangmanEmbed.setTitle("Hangman");
            hangmanEmbed.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))

            return msg.edit({ embeds: [hangmanEmbed], components: this.getComponents() });
        })

        hangmanCollector.on('end', (_, reason) => {
            if (reason === 'idle' || reason === 'user') return this.gameOver(msg, this.foundWord());
        })
    }


    gameOver(msg, result) {
        const GameOverMessage = (result ? this.options.winMessage : this.options.loseMessage);

        const description =
            this.getBoardContent() + "\n" +
            (this.guessed.length ? this.client.emotes.question + " **Geratene Buchstaben**\n" +
            this.client.emotes.arrow + " " + this.guessed.join(", ") + "\n\n" : "") +
            this.client.emotes.arrow + " " + GameOverMessage.replace("{word}", this.word);
            this.getWordEmojis();


        const gameOverEmbed = this.client.generateEmbed(description, null, "normal");
        gameOverEmbed.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }));
        gameOverEmbed.setTitle("Hangman");

        return msg.edit({ embeds: [gameOverEmbed], components: [] });
    }


    foundWord() {
        return this.word.toUpperCase().replace(/ /g, '').split('').every(l => this.guessed.includes(l));
    }

    getWordEmojis() {
        return this.word.toUpperCase().split('').map(l => this.guessed.includes(l) ? this.getAlphaEmoji(l) : ((l === ' ') ? '⬜' : this.client.emotes.question)).join(' ');
    }

    getComponents(page) {
        const components = [];
        if (page == 0 || page == 1) this.buttonPage = page;
        const letters = this.getAlphaEmoji(this.buttonPage ?? 0);
        const pageID = ('hangman_' + (this.buttonPage ? 0 : 1));

        for (let y = 0; y < 3; y++) {
            const row = new ActionRowBuilder();
            for (let x = 0; x < 4; x++) {

                const letter = letters[y * 4 + x];
                const btn = this.client.createButton("hangman_" + letter, letter, "Primary", null, this.guessed.includes(letter), null);
                row.addComponents(btn);
            }
            components.push(row);
        }

        const row4 = new ActionRowBuilder();
        const stop = this.client.createButton("hangman_stop", "Stop", "Danger", null, false, null);
        const pageBtn = this.client.createButton(pageID, null, "Secondary", this.buttonPage ? this.client.emotes.arrows.left : this.client.emotes.arrows.right, false, null);
        const letterY = this.client.createButton("hangman_Y", "Y", "Primary", null, this.guessed.includes("Y"), null);
        const letterZ = this.client.createButton("hangman_Z", "Z", "Primary", null, this.guessed.includes("Z"), null);
        row4.addComponents(pageBtn, stop);
        if(this.buttonPage) row4.addComponents(letterY, letterZ);

        components.push(row4);
        return components;
    }
}