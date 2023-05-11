const { ApplicationCommandType } = require("discord.js");
const BaseContext = require("@structures/BaseContext");

class Avatar extends BaseContext {
    constructor(client) {
        super(client, {
            name: "avatar",
            type: ApplicationCommandType.User,
            cooldown: 10 * 1000,
        })
    }

    static interaction;
    async dispatch(interaction){
        this.interaction = interaction;
        await this.showAvatar(interaction.targetUser);
    }
    async showAvatar(user){
        const x64 = user.displayAvatarURL({ extension: "png", size: 64 });
        const x128 = user.displayAvatarURL({ extension: "png", size: 128 });
        const x256 = user.displayAvatarURL({ extension: "png", size: 256 });
        const x512 = user.displayAvatarURL({ extension: "png", size: 512 });
        const x1024 = user.displayAvatarURL({ extension: "png", size: 1024 });
        const x2048 = user.displayAvatarURL({ extension: "png", size: 2048 });

        const avatarEmbed = this.client.createEmbed("Links: [x64]({0}) • [x128]({1}) • [x256]({2}) • [x512]({3}) • [x1024]({4}) • [x2048]({5})", null, "normal", x64, x128, x256, x512, x1024, x2048);
        avatarEmbed.setTitle("Avatar von " + user.tag);
        avatarEmbed.setImage(x256);

        return this.interaction.followUp({ embeds: [avatarEmbed] });
    }
}

module.exports = Avatar;