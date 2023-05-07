const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require("discord.js");

class Deletedata extends BaseCommand {
    constructor(client) {
        super(client, {
            name: 'deletedata',
            description: "Löscht deine Daten aus unserer Datenbank",

            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option => option
                        .setName("daten")
                        .setDescription("Wähle, welche Daten wir löschen sollen")
                        .setRequired(true)
                        .addChoices(
                            {
                                name: "deine Nutzerdaten auf allen Servern",
                                value: "user",
                            },
                            {
                                name: "deine Mitgliedsdaten auf diesem Server",
                                value: "member",
                            },
                            {
                                name: "Daten dieses Servers",
                                value: "guild",
                            }
                        )
                    )
                    .addStringOption(option => option
                        .setName("grund")
                        .setDescription("Teile uns gerne deinen Grund mit, damit wir uns verbessern können")
                        .setRequired(false)
                    )
            }
        });
    }

    static interaction;

    async dispatch(interaction, data) {
        this.interaction = interaction;
        await this.deleteData(interaction.member, interaction.options.getString("daten"), interaction.options.getString("grund"), data);
    }

    async deleteData(member, type, reason, data) {
        if(type === "guild" && (await this.interaction.guild.fetchOwner()).user.id !== this.interaction.user.id){
            const errorEmbed = this.client.generateEmbed("Nur der Eigentümer dieses Servers kann die Serverdaten löschen", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

        const typeAffects = {
            "user": [
                "AFK-Daten",
                "Partner-Daten",
                "Bug-Hunter-Daten"
            ],
            "member": [
                "Abstimmungs-Daten",
                "eingestellte Erinnerungen",
                "dein Level"
            ],
            "guild": [
                "Log-Channel",
                "Join2Create",
                "Ideen-Channel",
                "alle Level-Einstellungen",
                "Willkommensnachricht",
                "Verabschiedungsnachricht",
                "Mute-Rolle",
                "Autodelete",
                "Autoreact",
                "Reactionroes"
            ]
        }

        const types = {
            "user": "deine Nutzerdaten auf allen Servern",
            "member": "deine Mitgliedsdaten auf diesem Server",
            "guild": "die Daten dieses Servers"

        }

        const confirmationEmbed = this.client.generateEmbed("Bist du dir sicher, dass du **{0}** löschen möchtest? Folgende Daten sind davon betroffen:\n\n**{1}**", "warning", "warning", types[type], this.client.emotes.arrow + " " + typeAffects[type].join("\n" + this.client.emotes.arrow + " "));
        const buttonYes = this.client.createButton("yes", "Ja", "Success", this.client.emotes.success);
        const buttonNo = this.client.createButton("no", "Nein", "Danger", this.client.emotes.error);
        const buttonRow = this.client.createComponentsRow(buttonYes, buttonNo);
        const confirmationMessage = await this.interaction.followUp({ embeds: [confirmationEmbed], fetchReply: true, components: [buttonRow] });

        const filter = (button) => button.user.id === this.interaction.user.id;
        const collector = confirmationMessage.createMessageComponentCollector({ filter });

        collector.on("collect", async (button) => {
            if(button.customId === "no"){
                const cancelEmbed = this.client.generateEmbed("Die Daten wurden **nicht** gelöscht.", "error", "error");
                await button.update({ embeds: [cancelEmbed], components: [] });
                return collector.stop();
            }

            if(type === "user"){
                const blockedOld = data.user.blocked;
                await this.client.deleteUser({ id: this.interaction.user.id });
                // block user again, if he was blocked before
                if(blockedOld.state){
                    const newUserdata = await this.client.findOrCreateUser({ id: this.interaction.user.id });
                    newUserdata.blocked = blockedOld;
                    newUserdata.markModified("blocked");
                    await newUserdata.save();
                }
                const successEmbed = this.client.generateEmbed("Deine Nutzerdaten wurden erfolgreich gelöscht.", "success", "success");
                await button.update({ embeds: [successEmbed], components: [] });
                return collector.stop();
            }
            if(type === "member"){
                const warningsOld = data.member.warnings;
                const bannedOld = data.member.banned;
                const mutedOld = data.member.muted;

                await this.client.deleteMember({ id: this.interaction.user.id, guildID: this.interaction.guild.id });
                // ban/mute/warn user again, if he was banned/muted/warned before
                if(bannedOld.state || mutedOld.state || warningsOld.length > 0){
                    const newMemberdata = await this.client.findOrCreateMember({ id: this.interaction.user.id, guildID: this.interaction.guild.id });
                    newMemberdata.banned = bannedOld;
                    newMemberdata.muted = mutedOld;
                    newMemberdata.warnings = warningsOld;
                    newMemberdata.markModified("banned");
                    newMemberdata.markModified("muted");
                    newMemberdata.markModified("warnings");
                    await newMemberdata.save();
                }

                const successEmbed = this.client.generateEmbed("Deine Mitgliedsdaten wurden erfolgreich gelöscht.", "success", "success");
                await button.update({ embeds: [successEmbed], components: [] });
                return collector.stop();
            }
            if(type === "guild"){
                const blockedOld = data.guild.blocked;

                await this.client.deleteGuild({ id: this.interaction.guild.id });

                // block guild again, if it was blocked before
                if(blockedOld.state){
                    const newGuilddata = await this.client.findOrCreateGuild({ id: this.interaction.guild.id });
                    newGuilddata.blocked = blockedOld;
                    newGuilddata.markModified("blocked");
                    await newGuilddata.save();
                }
            }
        });
    }
}

module.exports = Deletedata;