const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');

class Snake extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "snake",
            description: "Startet eine Runde Snake für dich",

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
        const game = new SnakeGame({
            interaction: this.interaction,
            client: this.client
        });
        await game.startGame();
    }
}

module.exports = Snake;


class SnakeGame {
    constructor(options = {}) {
        options.snake = {
            head: '🟢',
            body: '🟩',
            tail: '🟢',
            skull: '💀'
        };

        options.emojis = {
            board: '⬛',
            food: '🍎',
            up: options.client.emotes.arrows.up,
            down: options.client.emotes.arrows.down,
            left: options.client.emotes.arrows.left,
            right: options.client.emotes.arrows.right,
        };

        options.foods = [];
        options.stopButton = 'Stop';

        this.client = options.client;
        this.options = options;
        this.interaction = options.interaction;
        this.snake = [{ x: 5, y: 5 }];
        this.apple = { x: 1, y: 1 };
        this.snakeLength = 1;
        this.gameBoard = [];
        this.score = 0;

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 15; x++) {
                this.gameBoard[y * 15 + x] = options.emojis.board;
            }
        }
    }


    getBoardContent(isSkull) {
        const emojis = this.options.snake;
        let board = '';

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 15; x++) {

                if (x == this.apple.x && y == this.apple.y) {
                    board += this.options.emojis.food;
                    continue;
                }

                if (this.isSnake({ x: x, y: y })) {
                    const pos = this.snake.indexOf(this.isSnake({ x: x, y: y }));
                    if (pos === 0) {
                        const isHead = (!isSkull || (this.snakeLength >= (10 * 15) ));
                        board += isHead ? emojis.head : emojis.skull;
                    } else if (pos === this.snake.length - 1) {
                        board += emojis.tail;
                    } else {
                        board += emojis.body;
                    }
                }

                if (!this.isSnake({ x: x, y: y })) board += this.gameBoard[y * 15 + x];
            }
            board += '\n';
        }
        return board;
    }


    isSnake(pos) {
        return this.snake.find(snake => ( snake.x == pos.x && snake.y == pos.y )) ?? false;
    }


    updateFoodLoc() {
        let applePos = { x: 0, y: 0 };
        do {
            applePos = { x: parseInt(Math.random() * 15), y: parseInt(Math.random() * 10) };
        } while (this.isSnake(applePos));

        const foods = this.options.foods;
        if (foods.length) this.options.emojis.food = foods[Math.floor(Math.random() * foods.length)];
        this.apple = { x: applePos.x, y: applePos.y };
    }


    async sendMessage(content) {
        return await this.interaction.editReply(content);
    }


    async startGame() {
        await this.interaction.deferReply().catch(e => {});

        const emojis = this.options.emojis;
        this.updateFoodLoc();


        const snakeEmbed = this.client.createEmbed(" Punkte: " + this.score + "\n\n" + this.getBoardContent(), "arrow", "normal");
        snakeEmbed.setTitle("Snake");
        snakeEmbed.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }));

        const up = this.client.createButton("snake_up", null, "Primary", this.client.emotes.arrows.up);
        const down = this.client.createButton("snake_down", null, "Primary", this.client.emotes.arrows.down);
        const left = this.client.createButton("snake_left", null, "Primary", this.client.emotes.arrows.left);
        const right = this.client.createButton("snake_right", null, "Primary", this.client.emotes.arrows.right);
        const stop = this.client.createButton("snake_stop", "Stop", "Danger");

        const dis1 = this.client.createButton("dis1", "\u200b", "Secondary", null, true);
        const dis2 = this.client.createButton("dis2", "\u200b", "Secondary", null, true);

        const row1 = this.client.createMessageComponentsRow(dis1, up, dis2, stop);
        const row2 = this.client.createMessageComponentsRow(left, down, right);

        const msg = await this.sendMessage({ embeds: [snakeEmbed], components: [row1, row2] });
        return this.handleButtons(msg);
    }


    updateGame(msg) {
        if (this.apple.x == this.snake[0].x && this.apple.y == this.snake[0].y) {
            this.score += 1;
            this.snakeLength += 1;
            this.updateFoodLoc();
        }

        const snakeEmbed = this.client.createEmbed(" Punkte: " + this.score + "\n\n" + this.getBoardContent(), "arrow", "normal");
        snakeEmbed.setTitle("Snake");
        snakeEmbed.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }));

        return msg.edit({ embeds: [snakeEmbed] });
    }


    disableButtons(components) {
        for (let x = 0; x < components.length; x++) {
            for (let y = 0; y < components[x].components.length; y++) {
                components[x].components[y].data.disabled = true;
            }
        }
        return components;
    }

    gameOver(msg) {
        const gameOverEmbed = this.client.createEmbed("Das Spiel ist vorbei, du hast " + this.score + " Punkte erreicht.\n\n" + this.getBoardContent(true), "arrow", "normal");
        gameOverEmbed.setTitle("Snake");
        gameOverEmbed.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }));

        return msg.edit({ embeds: [gameOverEmbed], components: this.disableButtons(msg.components) });
    }


    handleButtons(msg) {
        const snakeCollector = msg.createMessageComponentCollector({ filter: btn => btn.user.id === this.interaction.user.id });

        snakeCollector.on('collect', async btn => {
            await btn.deferUpdate().catch(e => {});

            const snakeHead = this.snake[0];
            const nextPos = { x: snakeHead.x, y: snakeHead.y };
            const ButtonID = btn.customId.split('_')[1];


            if (ButtonID === 'left') nextPos.x = ( snakeHead.x - 1 );
            else if (ButtonID === 'right') nextPos.x = ( snakeHead.x + 1 );
            else if (ButtonID === 'down') nextPos.y = ( snakeHead.y + 1 );
            else if (ButtonID === 'up') nextPos.y = ( snakeHead.y - 1 );


            if (nextPos.x < 0 || ( nextPos.x >= 15 )) {
                nextPos.x = (nextPos.x < 0) ? 0 : (15 - 1);
                return snakeCollector.stop();
            }

            if (nextPos.y < 0 || ( nextPos.y >= 10 )) {
                nextPos.y = (nextPos.y < 0) ? 0 : (10 - 1);
                return snakeCollector.stop();
            }


            if (this.isSnake(nextPos) || ButtonID === 'stop') return snakeCollector.stop();
            else {
                this.snake.unshift(nextPos);
                if (this.snake.length > this.snakeLength) this.snake.pop();
                this.updateGame(msg);
            }
        })


        snakeCollector.on('end', async (_, reason) => {
            if (reason === 'idle' || reason === 'user') return this.gameOver(msg);
        })
    }
}