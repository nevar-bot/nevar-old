const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');
const squares = ['🟥', '🟦', '🟧', '🟪', '🟩'];

class Flood extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "flood",
            description: "Startet eine Runde Flood für dich",

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
        const game = new FloodGame({
            interaction: this.interaction,
            client: this.client
        });

        await game.startGame();
    }
}

module.exports = Flood;


class FloodGame {
    constructor(options = {}) {
        options.difficulty = 13;
        options.timeoutTime = 60000;
        options.buttonStyle = 'PRIMARY';
        options.winMessage = 'Du hast das Spiel nach **{turns}** Zügen gewonnen.';
        options.loseMessage = 'Du hast das Spiel nach **{turns}** Zügen verloren.';
        options.emojis = ['🟥', '🟦', '🟧', '🟪', '🟩'];
        squares.splice(0, 5, ...options.emojis);

        this.options = options;
        this.interaction = options.interaction;
        this.length = options.difficulty;
        this.gameBoard = [];
        this.maxTurns = 0;
        this.turns = 0;

        for (let y = 0; y < this.length; y++) {
            for (let x = 0; x < this.length; x++) {
                this.gameBoard[y * this.length + x] = squares[Math.floor(Math.random() * squares.length)];
            }
        }
    }

    getBoardContent() {
        let board = '';
        for (let y = 0; y < this.length; y++) {
            for (let x = 0; x < this.length; x++) {
                board += this.gameBoard[y * this.length + x];
            }
            board += '\n';
        }
        return board;
    }

    async sendMessage(content) {
        return await this.interaction.editReply(content).catch(e => {});
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
        if (!this.interaction.deferred) await this.interaction.deferReply().catch(e => {});
        this.interaction.author = this.interaction.user;
        this.maxTurns = Math.floor((25 * (this.length * 2)) / 26);

        const embed = this.options.client.createEmbed("Züge: " + this.turns + "/" + this.maxTurns + "\n\n" + this.getBoardContent(), "arrow", "normal")

        const btn1 = this.options.client.createButton("flood_0", null, "Primary", squares[0]);
        const btn2 = this.options.client.createButton("flood_1", null, "Primary", squares[1]);
        const btn3 = this.options.client.createButton("flood_2", null, "Primary", squares[2]);
        const btn4 = this.options.client.createButton("flood_3", null, "Primary", squares[3]);
        const btn5 = this.options.client.createButton("flood_4", null, "Primary", squares[4]);
        const row = this.options.client.createMessageComponentsRow(btn1, btn2, btn3, btn4, btn5);

        const msg = await this.sendMessage({ embeds: [embed], components: [row] });
        const collector = msg.createMessageComponentCollector({ filter: btn => btn.user.id === this.interaction.user.id });

        collector.on('collect', async btn => {
            await btn.deferUpdate().catch(e => {});

            const update = await this.updateGame(squares[btn.customId.split('_')[1]], msg);
            if (!update && update !== false) return collector.stop();
            if (update === false) return;

            const embed = this.options.client.createEmbed("Züge: " + this.turns + "/" + this.maxTurns + "\n\n" + this.getBoardContent(), "arrow", "normal")
            return await msg.edit({ embeds: [embed], components: [row] });
        })

        collector.on('end', (_, reason) => {
            if (reason === 'idle') return this.gameOver(msg, false);
        })
    }

    gameOver(msg, result) {
        const GameOverMessage = result ? this.options.winMessage : this.options.loseMessage;

        const embed = this.options.client.createEmbed("Spiel beendet\n" + this.options.client.emotes.arrow + " " + GameOverMessage.replace("{turns}", this.turns) + "\n\n" + this.getBoardContent(), "rocket", "normal");
        return msg.edit({ embeds: [embed], components: this.disableButtons(msg.components) });
    }

    async updateGame(selected, msg) {
        if (selected === this.gameBoard[0]) return false;
        const firstBlock = this.gameBoard[0];
        const queue = [{ x: 0, y: 0 }];
        const visited = [];
        this.turns += 1;


        while (queue.length > 0) {
            const block = queue.shift();
            if (!block || visited.some(v => v.x === block.x && v.y === block.y)) continue;
            const index = (block.y * this.length + block.x);

            visited.push(block);
            if (this.gameBoard[index] === firstBlock) {
                this.gameBoard[index] = selected;

                const up = { x: block.x, y: block.y - 1 };
                if (!visited.some(v => v.x === up.x && v.y === up.y) && up.y >= 0) queue.push(up);

                const down = { x: block.x, y: block.y + 1 };
                if (!visited.some(v => v.x === down.x && v.y === down.y) && down.y < this.length) queue.push(down);

                const left = { x: block.x - 1, y: block.y };
                if (!visited.some(v => v.x === left.x && v.y === left.y) && left.x >= 0) queue.push(left);

                const right = { x: block.x + 1, y: block.y };
                if (!visited.some(v => v.x === right.x && v.y === right.y) && right.x < this.length) queue.push(right);
            }
        }

        let gameOver = true;
        for (let y = 0; y < this.length; y++) {
            for (let x = 0; x < this.length; x++) {
                if (this.gameBoard[y * this.length + x] !== selected) gameOver = false;
            }
        }

        if (this.turns >= this.maxTurns && !gameOver) return void this.gameOver(msg, false);
        if (gameOver) return void this.gameOver(msg, true);
        return true;
    }
}