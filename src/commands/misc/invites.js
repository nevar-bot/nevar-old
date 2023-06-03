const BaseCommand = require("@structures/BaseCommand");
const { SlashCommandBuilder } = require("discord.js");

class Invites extends BaseCommand {
    constructor(client) {
        super(client, {
            name: "invites",
            description: "Zeigt Statistiken zu deinen Invites",

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
        const guildInvites = await this.interaction.guild.invites.fetch().catch(() => {});

        const memberInvites = guildInvites.filter(i => i.inviterId === memberData.id);
        for(let invite of memberInvites.values()){
            if(!this.client.invites.get(this.interaction.guild.id).has(invite.code)) this.client.invites.get(this.interaction.guild.id).set(invite.code, invite.uses);
            if(!memberData.invites) memberData.invites = [];
            if(!memberData.invites.find(i => i.code === invite.code)) memberData.invites.push({ code: invite.code, uses: invite.uses, fake: 0 });
        }
        memberData.markModified("invites");
        await memberData.save();
        const invites = memberData.invites;
        const invitesData = [];
        for(const invite of invites){
            invitesData.push("**discord.gg/" + invite.code + "**\n" + this.client.emotes.users + " Verwendungen: **" + invite.uses + "**\n" + this.client.emotes.leave + " Server verlassen: **" + (invite.left || 0) + "**\n" + this.client.emotes.error + " Gefälscht: **" + (invite.fake || 0) + "**\n");
        }

        await this.client.utils.sendPaginatedEmbed(this.interaction, 5, invitesData, "Deine Einladungen", "Du hast noch keine Nutzer eingeladen", "invite");
    }
}
module.exports = Invites;