module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "other";
    }

    getType(){ return this.type }

    async dispatch(interaction, data, guild, suggestion, image) {
        // Send suggestion to suggestion channel
        const suggestionEmbed = this.client.generateEmbed(suggestion, "arrow", "normal");
        suggestionEmbed.setTitle("Idee von " + interaction.member.user.username);
        suggestionEmbed.setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }));
        suggestionEmbed.setImage(image);
        suggestionEmbed.setFooter({ text: "👍 0 • 👎 0" });

        const id = interaction.member.user.id;
        const yesButton = this.client.createButton("suggestion_" + id + "_yes", "", "Secondary", this.client.emotes.success, false, null);
        const noButton = this.client.createButton("suggestion_" + id + "_no", "", "Secondary", this.client.emotes.error, false, null);
        const voteRow = this.client.createComponentsRow(yesButton, noButton);

        const suggestionChannel = guild.channels.cache.get(data.guild.settings.suggestions.channel);
        if(!suggestionChannel) return;
        const embedSent = await suggestionChannel.send({ embeds: [suggestionEmbed], components: [voteRow] }).catch((e) => {console.log(e)});

        // Send suggestion to review channel
        const reviewChannel = guild.channels.cache.get(data.guild.settings.suggestions.review_channel);
        if(!reviewChannel) return;

        const reviewEmbed = this.client.generateEmbed(suggestion, "arrow", "normal");
        reviewEmbed.setTitle("Idee von " + interaction.member.user.username);
        reviewEmbed.setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }));

        const acceptButton = this.client.createButton("review_suggestion_" + embedSent.id + "_" + suggestionChannel.id + "_accept", "Annehmen", "Success", this.client.emotes.success, false, null);
        const declineButton = this.client.createButton("review_suggestion_" + embedSent.id + "_" + suggestionChannel.id + "_decline", "Ablehnen", "Danger", this.client.emotes.error, false, null);
        const reviewRow = this.client.createComponentsRow(acceptButton, declineButton);

        await reviewChannel.send({ embeds: [reviewEmbed], components: [reviewRow] }).catch(() => {});
    }
}