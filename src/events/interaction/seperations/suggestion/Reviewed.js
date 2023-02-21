const {EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require("discord.js");
module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "other";
    }
    getType(){ return this.type }
    async dispatch(interaction, customIdSplitted, data, guild) {

        // GET MESSAGE ID, CHANNEL ID AND TYPE
        const messageId = customIdSplitted[2];
        const channelId = customIdSplitted[3];
        const type = customIdSplitted[4];

        // GET THE CHANNEL
        const suggestionChannel = await guild.channels.fetch(channelId).catch(() => {});
        if(!suggestionChannel) return interaction.deferUpdate();

        const id = interaction.user.id;
        const user = interaction.user;

        const reasonModal = new ModalBuilder()
            .setTitle("Idee" + (type === 'accept' ? " annehmen" : " ablehnen"))
            .setCustomId(id + "_suggestion_" + this.client.utils.getRandomKey(10))

        const reasonInput = new TextInputBuilder()
            .setLabel("Gib ggf. einen Grund an")
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
            .setCustomId("reason");

        const modalInputRow = this.client.createComponentsRow(reasonInput);
        reasonModal.addComponents(modalInputRow);

        // Show modal
        await interaction.showModal(reasonModal);

        const suggestionEmbed = await suggestionChannel.messages.fetch(messageId).catch(() => {});
        if(!suggestionEmbed) return interaction.deferUpdate();
        const description = suggestionEmbed.embeds[0].description;
        const title = suggestionEmbed.embeds[0].title;

        const collected = await interaction.awaitModalSubmit({ filter: i => i.user.id === user.id, time: 3 * 60 * 1000 });

        if(collected){
            const reason = collected.fields.getTextInputValue("reason") || "Kein Grund angegeben";
            // if(!reason || reason === "") reason = "Kein Grund angegeben"

            if(!suggestionEmbed) return collected.deferUpdate();
            if(suggestionEmbed.author.id !== this.client.user.id) return collected.deferUpdate();

            const embedData = suggestionEmbed.embeds[0].data;
            if(type === "accept"){
                embedData.title = "Angenommene " + title;
                embedData.description = description + "\n\n" + this.client.emotes.arrow + " Moderator: " + user.username +"\n" + this.client.emotes.arrow + " Grund: " + reason;
                embedData.color = 5763719;
            }else if(type === "decline"){
                embedData.title = "Abgelehnte " + title;
                embedData.description = description + "\n\n" + this.client.emotes.arrow + " Moderator: " + user.username +"\n" + this.client.emotes.arrow + " Grund: " + reason;
                embedData.color = 15548997;
            }
            suggestionEmbed.edit({ embeds: [embedData], components: [] });
            await collected.deferUpdate().catch(() => {});
            await interaction.message.delete().catch(() => {});
        }
    }
}