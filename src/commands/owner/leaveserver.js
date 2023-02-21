const BaseCommand = require('@structures/BaseCommand');
const { EmbedBuilder, SlashCommandBuilder} = require("discord.js");

class Leaveserver extends BaseCommand {
    constructor(client){
        super(client, {
            name: "leaveserver",
            description: "Verlässt einen Server",

            cooldown: 3000,
            ownerOnly: true,
            dirname: __dirname,

            slashCommand: {
                addCommand: false
            }
        });
    }

    static message;
    async dispatch(message, args, data){
        this.message = message;

        await this.leaveServer(args[0]);
    }

    async leaveServer(guildID){
        if(!guildID){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst eine Server-ID angeben.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        const guild = this.client.guilds.cache.get(guildID);

        if(!guild){
            const invalidOptionsEmbed = this.client.generateEmbed("Der Server konnte nicht gefunden werden.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        if(guild.id === this.client.config.support["ID"]){
            const invalidOptionsEmbed = this.client.generateEmbed("Ich kann den Support-Server nicht verlassen.", "error", "error");
            return this.message.reply({ embeds: [invalidOptionsEmbed] });
        }

        await guild.leave();

        const successEmbed = this.client.generateEmbed("Ich habe {0} verlassen.", "success", "success", guild.name);
        return this.message.reply({ embeds: [successEmbed] });

    }
}

module.exports = Leaveserver;
