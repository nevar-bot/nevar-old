const {EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require("discord.js");
module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "other";
    }
    getType(){
        return this.type;
    }
    async dispatch(interaction, customIdSplitted, data, guild) {

        // GET MESSAGE ID, CHANNEL ID AND TYPE
        let messageId = customIdSplitted[2];
        let channelId = customIdSplitted[3];
        let type = customIdSplitted[4];

        // GET THE CHANNEL
        let channelObj = guild.channels.cache.get(channelId);
        if(channelObj){
            // ASK FOR THE REASON

            let id = interaction.user.id;
            let user = interaction.user;
            let key = this.client.randomKey(10);
            const reasonModal = new ModalBuilder()
                .setCustomId(id + '_suggest_modal' + '_' + key)
                .setTitle(guild.translate("misc/suggest:main:modal:title"));

            const reasonInput = new TextInputBuilder()
                .setCustomId('reason')
                .setLabel(guild.translate("misc/suggest:main:modal:labels:reason"))
                .setRequired(false)
                .setStyle(TextInputStyle.Short);


            let firstModalRow = new ActionRowBuilder().addComponents(reasonInput);

            reasonModal.addComponents(firstModalRow);

            await interaction.showModal(reasonModal);

            const submitted = await interaction.awaitModalSubmit({
                time: 600000,
                filter: i => i.user.id = user.id
            }).catch(() => {});

            if (submitted) {
                if (submitted.customId !== id + '_suggest_modal' + '_' + key) return;

                let reasonInput = submitted.fields.getTextInputValue('reason');

                let reason = reasonInput;
                if(reasonInput.length < 1) reason = guild.translate("administration/suggestsettings:main:noReason")

                // EDIT THE SUGGESTION EMBED
                let suggestionEmbed = await channelObj.messages.fetch(messageId);
                if(suggestionEmbed){
                    if(suggestionEmbed.author.tag !== this.client.user.tag) return;
                    let msgEmbed = suggestionEmbed.embeds[0].data;
                    if(type === 'accept') {
                        msgEmbed.title = guild.translate("administration/suggestsettings:main:accepted") + msgEmbed.title
                        msgEmbed.description = msgEmbed.description + '\n\n' + guild.translate("administration/suggestsettings:main:reason").replace('{mod}', interaction.member.user.username) + reason;
                        msgEmbed.color = 5763719;
                    }
                    if(type === 'decline') {
                        msgEmbed.title = guild.translate("administration/suggestsettings:main:declined") + msgEmbed.title
                        msgEmbed.description = msgEmbed.description + '\n\n' + guild.translate("administration/suggestsettings:main:reason").replace('{mod}', interaction.member.user.username) + reason;
                        msgEmbed.color = 15548997;
                    }

                    // EDIT THE SUGGESTION AS WELL AS THE MODERATOR EMBED
                    suggestionEmbed.edit({embeds:[msgEmbed], components: []});
                    let originalEmbed = interaction.message.embeds[0];
                    submitted.deferUpdate();
                    interaction.message.delete().catch(() => {
                        interaction.message.edit({embeds:[msgEmbed], components: []});
                    });

                }

            }
        }
    }
}