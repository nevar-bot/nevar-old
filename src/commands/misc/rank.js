const BaseCommand = require('@structures/BaseCommand');
const Levels = require('discord-xp');
const canvacord = require('canvacord');
const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");

class Rank extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "rank",
            description: "Sendet deine Levelcard",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                        .addUserOption(option => option
                            .setName("mitglied")
                            .setDescription("Wähle ein Mitglied, dessen Levelcard du sehen möchtest")
                            .setRequired(false)
                        )
            }
        });
    }

    static interaction;

    async dispatch(interaction, args, data){
        this.interaction = interaction;

        const user = interaction.options.getUser("mitglied") || interaction.user;

        const userData = {
            user: user,
            level: await Levels.fetch(user.id, interaction.guild.id, true),
        }

        const rank = new canvacord.Rank()
            // Avatar, status, username and discriminator
            .setUsername(userData.user.username)
            .setDiscriminator(userData.user.discriminator)
            .setAvatar(userData.user.displayAvatarURL({format: 'png', size: 512}))
            .setStatus("online", false, false)
            .renderEmojis(true)

            // Rank and rank
            .setLevel(userData.level.level || 0, "LEVEL")
            .setLevelColor('#5773c9')
            .setRank(userData.level.position, "RANG")

            // Progress bar
            .setProgressBar('#5773c9', "COLOR", true)
            .setProgressBarTrack('#ffffff')

            // XP
            .setCurrentXP((Levels.xpFor(userData.level.level + 1) - Levels.xpFor(userData.level.level))- (Levels.xpFor(userData.level.level + 1) - userData.level.xp))
            .setRequiredXP(Levels.xpFor(userData.level.level + 1) - Levels.xpFor(userData.level.level))

        rank.build()
            .then(data => {
                const attachment = new AttachmentBuilder(data, { name: "level-" + userData.user.id + ".png"})
                return interaction.followUp({files: [attachment]});
            });
    }
}

module.exports = Rank;
