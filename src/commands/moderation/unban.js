const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require("discord.js");

class Unban extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "unban",
            description: "Entbannt ein Mitglieds",

            memberPermissions: ["BanMembers"],

            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                        .addStringOption(option => option
                            .setName("nutzer")
                            .setDescription("Gib hier die ID des Nutzers an")
                            .setRequired(true)
                        )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.unban(interaction.options.getString("nutzer"));
    }

    async unban(user){
        user = await this.client.resolveUser(user);
        console.log(user);
        if(!user || !user.id){
            const invalidOptionsEmbed = this.client.generateEmbed("Du musst eine ID angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidOptionsEmbed] });
        }

        const guildBans = await this.interaction.guild.bans.fetch();
        if(!guildBans.some((u) => u.user.id === user.id)){
            const isNotBannedEmbed = this.client.generateEmbed("{0} ist nicht gebannt.", "error", "error", user.tag);
            return this.interaction.followUp({ embeds: [isNotBannedEmbed] });
        }

        try {
            await this.interaction.guild.members.unban(user.id);
            const memberData = await this.client.findOrCreateMember({ id: user.id, guildID: this.interaction.guild.id });
            memberData.banned = {
                state: false,
                reason: null,
                moderator: {
                    name: null,
                    id: null
                },
                duration: null,
                bannedAt: null,
                bannedUntil: null
            };
            memberData.markModified("banned");
            await memberData.save();
            this.client.databaseCache.bannedUsers.delete(memberData.id + memberData.guildID);

            const successEmbed = this.client.generateEmbed("{0} wurde entbannt.", "success", "success", user.tag);
            return this.interaction.followUp({ embeds: [successEmbed] });
        }catch(e){
            const errorEmbed = this.client.generateEmbed("Ich konnte {0} nicht entbannen.", "error", "error", user.tag);
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }
    }
}
module.exports = Unban;
