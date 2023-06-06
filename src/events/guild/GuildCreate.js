const { ChannelType, PermissionsBitField } = require('discord.js');
const moment = require("moment");

module.exports = class {
    constructor(client) {
        this.client = client
    }
    async dispatch(guild){
        if(!guild || !guild.id || !guild.available) return
        await guild.fetch();

        // Cache guild invites
        guild.invites.fetch().then(guildInvites => {
            this.client.invites.set(guild.id, new Map(guildInvites.map((invite) => [invite.code, invite.uses])));
        });

        // Send welcome message
        const firstChannel = guild.channels.cache.find(c => (c.type === ChannelType.GuildText || c.type === ChannelType.GuildText) && c.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages));

        const text =
            "Danke, dass ich hier sein darf!\n\n" +
            this.client.emotes.arrow + " Eine **Übersicht meiner Befehle** erhältst du mit {0}\n" +
            this.client.emotes.arrow + " Unten sind zusätzlich ein paar **hilfreiche Links** zu finden.\n\n" +
            this.client.emotes.arrow + " Bei Fragen oder Problemen stehen wir jederzeit gerne zur Verfügung";

        const helpCommand = (await this.client.application.commands.fetch()).find((cmd) => cmd.name === "help")?.id;
        const welcomeEmbed = this.client.createEmbed(text, "shine", "normal", (helpCommand ? "</help:" + helpCommand + ">" : "/help"));

        const inviteButton = this.client.createButton(null, "Einladen", "Link", "growth_up", false, this.client.createInvite());
        const supportButton = this.client.createButton(null, "Support", "Link", "discord", false, this.client.config.support["INVITE"]);
        const websiteButton = this.client.createButton(null, "Website", "Link", "globe", true, this.client.config.general["WEBSITE"]);
        const voteButton = this.client.createButton(null, "Voten", "Link", "heart", false, "https://discordbotlist.com/bots/" + this.client.user.id + "/upvote");
        const donateButton = this.client.createButton(null, "Unterstützen", "Link", "gift", false, "https://prohosting24.de/cp/donate/nevar");

        const buttonRow = this.client.createMessageComponentsRow(inviteButton, supportButton, websiteButton, voteButton, donateButton);
        await firstChannel.send({ embeds: [welcomeEmbed], components: [buttonRow] }).catch(() => {});
        await firstChannel.send({content: this.client.config.support["INVITE"]}).catch(() => {});


        // Send log message to support server
        const supportGuild = this.client.guilds.cache.get(this.client.config.support["ID"]);
        if(!supportGuild) return;

        const logChannel = supportGuild.channels.cache.get(this.client.config.support["BOT_LOG"]);
        if(!logChannel) return;

        const owner = await guild.fetchOwner();
        const id = guild.id;
        const membercount = guild.memberCount;
        const createdAt = moment(guild.createdTimestamp).format("DD.MM.YYYY, HH:mm");
        const createdDiff = this.client.utils.getRelativeTime(guild.createdTimestamp);
        const name = guild.name;

        const supportText =
            "Name: **" + name + "**\n" +
            this.client.emotes.crown + " Eigentümer: **" + owner.user.tag + "**\n" +
            this.client.emotes.id + " ID: **" + id + "**\n" +
            this.client.emotes.users + " Mitglieder: **" + membercount + "**\n\n" +
            this.client.emotes.calendar + " Erstellt am: **" + createdAt + "**\n" +
            this.client.emotes.reminder + " Erstellt vor **" + createdDiff + "**";

        const supportServerEmbed = this.client.createEmbed(supportText, "discord", "success", );
        supportServerEmbed.setTitle(this.client.emotes.shine + " " + this.client.user.username + " wurde einem Server hinzugefügt");
        supportServerEmbed.setThumbnail(guild.iconURL({dynamic: true, size: 512}));

        await logChannel.send({ embeds: [supportServerEmbed] }).catch(() => {});
    }
}
