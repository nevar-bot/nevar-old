const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require('discord.js');

class Invite extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "invite",
            description: "Sendet eine Liste wichtiger Links",

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

        await this.sendLinks();
    }

    async sendLinks(){

        // First row
        const inviteButton = this.client.createButton(null, "Einladen", "Link", this.client.emotes.growth_up, false, this.client.createInvite());
        const supportButton = this.client.createButton(null, "Support", "Link", this.client.emotes.discord, false, this.client.config.support["INVITE"]);
        const websiteButton = this.client.createButton(null, "Website", "Link", this.client.emotes.text, true, this.client.config.general["WEBSITE"]);
        const voteButton = this.client.createButton(null, "Voten", "Link", this.client.emotes.heart, false, "https://discordbotlist.com/bots/" + this.client.user.id + "/upvote");
        const buttonRow = this.client.createComponentsRow(inviteButton, supportButton, websiteButton, voteButton);

        // Second row
        const twitterButton = this.client.createButton(null, "Twitter", "Link", this.client.emotes.socials.twitter, false, "https://twitter.com/nevar_eu");
        const instagramButton = this.client.createButton(null, "Instagram", "Link", this.client.emotes.socials.instagram, false, "https://www.instagram.com/nevar_eu/");
        const githubButton = this.client.createButton(null, "GitHub", "Link", this.client.emotes.socials.github, false, "https://github.com/nevar-bot");
        const donateButton = this.client.createButton(null, "Unterstützen", "Link", this.client.emotes.gift, false, "https://prohosting24.de/cp/donate/nevar");
        const buttonRow2 = this.client.createComponentsRow(twitterButton, instagramButton, githubButton, donateButton);

        const linksEmbed = this.client.createEmbed("Hier hast du eine Auflistung wichtiger Links:", "arrow", "normal");

        return this.interaction.followUp({ embeds: [linksEmbed], components: [buttonRow, buttonRow2] });
    }
}

module.exports = Invite;
