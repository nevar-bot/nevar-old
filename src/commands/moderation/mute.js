const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder } = require("discord.js");
const ms = require("enhanced-ms")("de");
const moment = require("moment");

class Mute extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "mute",
            description: "Mutet ein Mitglied für eine bestimmte Zeit",

            memberPermissions: ["ManageRoles", "ModerateMembers"],
            botPermissions: ["ManageRoles"],

            cooldown: 5000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addUserOption(option => option
                        .setName("mitglied")
                        .setDescription("Wähle ein Mitglied")
                        .setRequired(true)
                    )
                    .addStringOption(option => option
                        .setName("grund")
                        .setDescription("Gib einen Grund an")
                        .setRequired(false)
                    )
                    .addStringOption(option => option
                        .setName("dauer")
                        .setDescription("Gib eine Dauer an (bspw. 1h, 1d, 1h 30m, etc.)")
                        .setRequired(false)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        await this.mute(interaction.options.getUser("mitglied"), interaction.options.getString("grund"), interaction.options.getString("dauer"), data);
    }

    async mute(member, reason, duration, data){

        if(!data.guild.settings.muterole || !this.interaction.guild.roles.cache.get(data.guild.settings.muterole)){
            const noMuteRoleEmbed = this.client.generateEmbed("Es ist keine Mute-Rolle eingestellt!", "error", "error");
            return this.interaction.followUp({ embeds: [noMuteRoleEmbed] });
        }

        member = await this.interaction.guild.resolveMember(member.id);
        if(!member){
            const noMemberEmbed = this.client.generateEmbed("Du musst ein Mitglied angeben.", "error", "error");
            return this.interaction.followUp({ embeds: [noMemberEmbed] });
        }

        if(member.user.id === this.interaction.user.id){
            const selfEmbed = this.client.generateEmbed("Du kannst dich nicht selbst muten.", "error", "error");
            return this.interaction.followUp({ embeds: [selfEmbed] });
        }

        if(member.user.id === this.client.user.id){
            const meEmbed = this.client.generateEmbed("Ich kann mich nicht selbst muten.", "error", "error");
            return this.interaction.followUp({ embeds: [meEmbed] });
        }

        if(member.user.bot){
            const botEmbed = this.client.generateEmbed("Du kannst keine Bots muten.", "error", "error");
            return this.interaction.followUp({ embeds: [botEmbed] });
        }

        if(member.roles.highest.position >= this.interaction.member.roles.highest.position){
            const higherRoleEmbed = this.client.generateEmbed("Du kannst keine Mitglieder muten, die eine höhere Rolle haben als du.", "error", "error");
            return this.interaction.followUp({ embeds: [higherRoleEmbed] });
        }

        const muteRole = this.interaction.guild.roles.cache.get(data.guild.settings.muterole);
        if([...muteRole.members].find((mutedUser) => mutedUser[0] === member.user.id)){
            const alreadyMutedEmbed = this.client.generateEmbed("{0} ist bereits gemutet.", "error", "error", member.user.tag);
            return this.interaction.followUp({ embeds: [alreadyMutedEmbed] });
        }

        if(duration && !ms(duration)){
            const invalidDurationEmbed = this.client.generateEmbed("Du hast eine ungültige Dauer angegeben.", "error", "error");
            return this.interaction.followUp({ embeds: [invalidDurationEmbed] });
        }

        const mute = {
            victim: member,
            reason: reason || "Kein Grund angegeben",
            duration: duration ? ms(duration) : 200 * 60 * 60 * 24 * 365 * 1000,
        };

        let relativeTime = this.client.utils.getRelativeTime(Date.now() - mute.duration);
        if(mute.duration === 200 * 60 * 60 * 24 * 365 * 1000){
            relativeTime = "Permanent";
        }
        let unmuteDate = moment(Date.now() + mute.duration).format("DD.MM.YYYY, HH:mm");
        if(mute.duration === 200 * 60 * 60 * 24 * 365 * 1000){
            unmuteDate = "/";
        }

        const areYouSureEmbed = this.client.generateEmbed("Bist du dir sicher, dass du {0} muten möchtest?", "arrow", "warning", member.user.tag);
        const buttonYes = this.client.createButton("confirm", "Ja", "Secondary", this.client.emotes.success);
        const buttonNo = this.client.createButton("decline", "Nein", "Secondary", this.client.emotes.error);
        const buttonRow = this.client.createComponentsRow(buttonYes, buttonNo);

        const confirmationAskMessage = await this.interaction.followUp({ embeds: [areYouSureEmbed], components: [buttonRow] });

        const confirmationButtonCollector = confirmationAskMessage.createMessageComponentCollector({ filter: (i) => i.user.id === this.interaction.user.id, time: 1000 * 60 * 5, max: 1 });
        confirmationButtonCollector.on("collect", async (clicked) => {
            const confirmation = clicked.customId;

            switch(confirmation){
                case "confirm":
                    mute.victim.roles.add(data.guild.settings.muterole, "MUTE - Dauer: " + relativeTime + " | Grund: " + mute.reason + " | Moderator: " + this.interaction.user.tag + " | Unmute am: " + unmuteDate)
                        .then(async () => {
                            const victimData = await this.client.findOrCreateMember({ id: mute.victim.user.id, guildID: this.interaction.guild.id });
                            victimData.muted = {
                                state: true,
                                reason: mute.reason,
                                moderator: {
                                    name: this.interaction.user.tag,
                                    id: this.interaction.user.id
                                },
                                duration: mute.duration,
                                mutedAt: Date.now(),
                                mutedUntil: Date.now() + mute.duration
                            };
                            victimData.markModified("muted");
                            await victimData.save();
                            this.client.databaseCache.mutedUsers.set(mute.victim.user.id + this.interaction.guild.id, victimData);

                            const privateText =
                                "Du wurdest auf {0} gemutet.\n\n" +
                                this.client.emotes.arrow + " Grund: " + mute.reason + "\n" +
                                this.client.emotes.arrow + " Dauer: " + relativeTime + "\n" +
                                this.client.emotes.arrow + " Moderator: " + this.interaction.user.tag + "\n" +
                                this.client.emotes.arrow + " Unmute am: " + unmuteDate;
                            const privateMuteEmbed = this.client.generateEmbed(privateText, "timeout", "error", this.interaction.guild.name);
                            await mute.victim.send({ embeds: [privateMuteEmbed] }).catch(() => {});

                            const logText =
                                " **Mitglied gemutet**\n\n" +
                                this.client.emotes.arrow + "Mitglied: " + mute.victim.user.tag + "\n" +
                                this.client.emotes.arrow + " Moderator: " + this.interaction.user.tag + "\n" +
                                this.client.emotes.arrow + " Grund: " + mute.reason;
                            await this.interaction.guild.logAction(logText, "moderation", this.client.emotes.timeout, "normal", mute.victim.user.displayAvatarURL({ dynamic: true }));


                            const publicText =
                                "{0} wurde gemutet.\n\n" +
                                this.client.emotes.arrow + " Grund: " + mute.reason + "\n" +
                                this.client.emotes.arrow + " Dauer: " + relativeTime + "\n" +
                                this.client.emotes.arrow + " Moderator: " + this.interaction.user.tag + "\n" +
                                this.client.emotes.arrow + " Unmute am: " + unmuteDate;
                            const publicMuteEmbed = this.client.generateEmbed(publicText, "timeout", "error", mute.victim.user.tag);
                            publicMuteEmbed.setImage("https://c.tenor.com/VphNodL96w8AAAAC/mute-discord-mute.gif");
                            await clicked.update({ embeds: [publicMuteEmbed], components: [] });
                        })
                        .catch(async () => {
                            const cantMuteEmbed = this.client.generateEmbed("Ich konnte {0} nicht muten.", "error", "error", mute.victim.user.tag);
                            await clicked.update({ embeds: [cantMuteEmbed], components: [] });
                        });
                    break;
                case "decline":
                    const declineEmbed = this.client.generateEmbed("{0} wurde nicht gemutet.", "error", "error", mute.victim.user.tag);
                    await clicked.update({ embeds: [declineEmbed], components: [] });
                    break;
            }
        })
    }
}

module.exports = Mute;
