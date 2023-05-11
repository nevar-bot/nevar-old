const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const eightBallAnswers = [
    "Ganz sicher",
    "Ohne Zweifel",
    "Absolut",
    "Ja",
    "Bestimmt",
    "Ganz bestimmt",
    "Mit Sicherheit",
    "Natürlich",
    "Ja, auf jeden Fall",
    "Auf alle Fälle",
    "Sieht gut aus",
    "Ja, es sieht danach aus",
    "Vermutlich",
    "Wahrscheinlich",
    "Ja, es scheint so",
    "Nein",
    "Auf keinen Fall",
    "Ganz sicher nicht",
    "Mit Sicherheit nicht",
    "Definitiv nicht",
    "Nein, auf keinen Fall",
    "Ich denke nicht",
    "Wahrscheinlich nicht",
    "Es sieht nicht danach aus",
    "Vielleicht",
    "Es könnte sein",
    "Kann sein",
    "Schwer zu sagen",
    "Frag mich später nochmal",
    "Besser, wenn du später fragst",
    "Ich bin mir nicht sicher",
    "Ich habe keine Ahnung",
    "Lass mich überlegen",
    "Ich brauche mehr Informationen",
    "Ich muss es nochmal überprüfen",
    "Gibt es eine spezifische Frage dazu?",
    "Konzentriere dich und stelle die Frage nochmal",
    "Ich fühle mich nicht sicher bei dieser Antwort",
    "Es tut mir leid, ich kann jetzt keine Antwort geben",
    "Das kann ich jetzt nicht vorhersagen",
    "Ich habe keine Vision für diese Frage",
    "Ich bin nicht in der Lage, darauf zu antworten",
    "Es tut mir leid, das weiß ich nicht",
    "Ich bin mir nicht sicher, frag mich später nochmal",
    "Es hängt alles von vielen Faktoren ab",
    "Das ist eine komplexe Frage",
    "Ich benötige mehr Zeit zur Überlegung",
    "Lass uns das später besprechen",
    "Das ist eine schwierige Frage",
    "Konzentriere dich und frage nochmal",
    "Ich denke darüber nach",
    "Lass uns später nochmal besprechen",
    "Ich muss mich erst vergewissern",
    "Das sieht nicht gut aus"
]

class Eightball extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "8ball",
            description: "Stelle eine Frage und erhalte magische Antworten",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option => option
                            .setRequired(true)
                            .setName("frage")
                            .setDescription("Gib deine Frage ein"))

            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {

        this.interaction = interaction;

        return this.getAnswer();
    }

    async getAnswer(){
        const randomAnswer = eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)];
        const eightBallEmbed = this.client.createEmbed("{0}", "question", "normal", randomAnswer);
        return this.interaction.followUp({ embeds: [eightBallEmbed] });
    }
}
module.exports = Eightball;
