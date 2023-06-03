const BaseCommand = require("@structures/BaseCommand");
const { SlashCommandBuilder } = require("discord.js");

class Invites extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "invites",
            description: "Invitesystem",

            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        })
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        const invites = await interaction.guild.invites.fetch();
        await this.showInvites(data.member);
    }

    async showInvites(memberData){
        const invites = memberData.invites;
        const invitesData = [];
        for(const invite of invites){
            invitesData.push("**" + invite.code + "** | " + invite.uses + " Verwendungen");
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 10, invitesData, "Deine Einladungen", "Du hast noch keine Nutzer eingeladen", "invite");
    }
}
module.exports = Invites;