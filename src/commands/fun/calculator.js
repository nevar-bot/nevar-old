const BaseCommand = require('@structures/BaseCommand');
const math = require('mathjs');
const { SlashCommandBuilder } = require('discord.js');

class Calculator extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "calculator",
            description: "Ein Taschenrechner auf Discord",

            cooldown: 5000,
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
        await this.buildCalculator(interaction.user);
    }

    async buildCalculator(user){
        const id = user.id;

        const embed = this.client.generateEmbed("```\u200b```", null, "normal");

         // First button row
        const acButton = this.client.createButton(id + "-ac", "AC", "Danger", null);
        const openBracketButton = this.client.createButton(id + "-openbracket", "(", "Primary", null);
        const closeBracketButton = this.client.createButton(id + "-closebracket", ")", "Primary", null);
        const divideButton = this.client.createButton(id + "-divide", "÷", "Primary", null);
        const firstRow = this.client.createComponentsRow(acButton, openBracketButton, closeBracketButton, divideButton);

        // Second button row
        const Button1 = this.client.createButton(id + "-1", "1", "Secondary", null);
        const Button2 = this.client.createButton(id + "-2", "2", "Secondary", null);
        const Button3 = this.client.createButton(id + "-3", "3", "Secondary", null);
        const multiplyButton = this.client.createButton(id + "-multiply", "x", "Primary", null);
        const secondRow = this.client.createComponentsRow(Button1, Button2, Button3, multiplyButton);

        // Third button row
        const Button4 = this.client.createButton(id + "-4", "4", "Secondary", null);
        const Button5 = this.client.createButton(id + "-5", "5", "Secondary", null);
        const Button6 = this.client.createButton(id + "-6", "6", "Secondary", null);
        const minusButton = this.client.createButton(id + "-minus", "-", "Primary", null);
        const thirdRow = this.client.createComponentsRow(Button4, Button5, Button6, minusButton);

        // Fourth button row
        const Button7 = this.client.createButton(id + "-7", "7", "Secondary", null);
        const Button8 = this.client.createButton(id + "-8", "8", "Secondary", null);
        const Button9 = this.client.createButton(id + "-9", "9", "Secondary", null);
        const plusButton = this.client.createButton(id + "-plus", "+", "Primary", null);
        const fourthRow = this.client.createComponentsRow(Button7, Button8, Button9, plusButton);

        // Fifth button row
        const removeButton = this.client.createButton(id + "-remove", "⌫", "Primary", null);
        const Button0 = this.client.createButton(id + "-0", "0", "Secondary", null);
        const commaButton = this.client.createButton(id + "-comma", ",", "Primary", null);
        const equalButton = this.client.createButton(id + "-equal", "=", "Success", null);
        const fifthRow = this.client.createComponentsRow(removeButton, Button0, commaButton, equalButton);

        const calculatorMessage = await this.interaction.followUp({ embeds: [embed], components: [firstRow, secondRow, thirdRow, fourthRow, fifthRow] });

        const buttonCollector = calculatorMessage.createMessageComponentCollector({ filter: (button) => button.user.id === id });

        let formula = "";
        buttonCollector.on("collect", async (buttonI) => {
            const id = buttonI.customId;
            const action = id.split("-")[1];

            switch(action){
                case "ac":
                    formula = "\u200b";
                    break;
                case "openbracket":
                    formula += "(";
                    break;
                case "closebracket":
                    formula += ")";
                    break;
                case "divide":
                    formula += "÷";
                    break;
                case "1":
                    formula += "1";
                    break;
                case "2":
                    formula += "2";
                    break;
                case "3":
                    formula += "3";
                    break;
                case "multiply":
                    formula += "x";
                    break;
                case "4":
                    formula += "4";
                    break;
                case "5":
                    formula += "5";
                    break;
                case "6":
                    formula += "6";
                    break;
                case "minus":
                    formula += "-";
                    break;
                case "7":
                    formula += "7";
                    break;
                case "8":
                    formula += "8";
                    break;
                case "9":
                    formula += "9";
                    break;
                case "plus":
                    formula += "+";
                    break;
                case "remove":
                    formula = formula.slice(0, -1);
                    break;
                case "0":
                    formula += "0";
                    break;
                case "comma":
                    formula += ",";
                    break;
                case "equal":
                    try {
                        formula = (math.evaluate(formula.replace(/[x]/gi, "*").replace(/[÷]/gi, "/").replace(/[,]/gi, ".").replace("\u200b", "")))?.toString();
                    }catch(exc){
                        formula = "\u200b";
                    }
            }
            if(!formula || formula === "") formula = "\u200b";
            embed.setDescription("```\n" + formula?.replace(/[.]/gi, ",") + "\n```");
            await buttonI.update({ embeds: [embed] });
        });
    }
}

module.exports = Calculator;
