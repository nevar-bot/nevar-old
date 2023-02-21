const Command = require('../../structures/BaseCommand');
const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const moment = require('moment');
const fs = require("fs");

class Help extends Command {

    constructor(client) {
        super(client, {
            name: "help",
            description: "misc/help:general:description",
            cooldown: 3000,
            dirname: __dirname,
            slashCommand: {
                addCommand: false,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option => option.setRequired(false))
            }
        });
    }

    async run(interaction, args, data) {
        const { guild, member, channel, user } = interaction;

        // check if user requested command help
        let cmd;
        if(args[0]) cmd = this.client.commands.get(args[0].toString().toLowerCase());

        if(cmd){
            // send help embed for specific command
            const embed = new EmbedBuilder()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setColor(this.client.embedColor)
                .setTitle(guild.translate("misc/help:main:command:helpFor")
                    .replace('{command}', cmd.help.name.charAt(0).toUpperCase() + cmd.help.name.slice(1))
                    .replace('{category}', guild.translate("misc/help:main:categoriesList:" + cmd.help.category)))
                .setDescription('```● ' + guild.translate(cmd.help.description) + '```')
                .addFields([
                    {
                        name:
                            this.client.emotes.arrow + ' ' + guild.translate("misc/help:main:command:syntax:name"),
                        value:
                            '```' + guild.translate("misc/help:main:command:syntax:value")
                                .replace('{syntax}', guild.translate(cmd.help.category + '/' + cmd.help.name + ':general:syntax')) + '```'
                    },
                    {
                        name:
                            this.client.emotes.arrow + ' ' + guild.translate("misc/help:main:command:examples:name"),
                        value:
                            '```' + guild.translate("misc/help:main:command:examples:value")
                                .replace('{examples}', guild.translate(cmd.help.category + '/' + cmd.help.name + ':general:examples')) + '```'
                    },
                    {
                        name:
                            this.client.emotes.arrow + ' ' + guild.translate("misc/help:main:command:cooldown:name"),
                        value:
                            '```● ' + guild.translate("misc/help:main:command:cooldown:value")
                                .replace('{cooldown}', cmd.conf.cooldown/1000) + '```',
                    },
                    {
                        name:
                            this.client.emotes.arrow + ' ' + guild.translate("misc/help:main:command:permissions:name"),
                        value:
                            '```● ' + guild.translate("misc/help:main:command:permissions:value")
                                .replace('{permissions}', cmd.conf.memberPermissions.length > 0 ? cmd.conf.memberPermissions.join('\n● ') : guild.translate("language:noEntries")) + '```'
                    }
                ])
                .setThumbnail(this.client.user.displayAvatarURL())
                .setFooter({text: this.client.footer});
             return interaction.send(embed);
        }

        // send help embed for all commands
        let desc = guild.translate("misc/help:main:links")
            .replace('{emotes.client}', this.client.emotes.discord)
            .replace('{support}', this.client.supportUrl)
            .replace('{emotes.logo}', this.client.emotes.logo.transparent)
            .replace('{invite}', this.client.invite)
            .replace('{emotes.web}', this.client.emotes.url)
            .replace('{website}', this.client.website)

        desc += guild.translate("misc/help:main:prefix")
            .replace('{prefix}', data.guild.prefix)

        const categories = [];
        const commands = this.client.commands;
        let staffs = JSON.parse(fs.readFileSync('./storage/staffs.json'));

        commands.forEach((command) => {
            if (!categories.includes(command.help.category)) {
                if (command.help.category === "owner" && ((member.user.id !== this.client.config.general.ownerId) && staffs[member.user.id] !== 'head_staff')) return;
                if (command.help.category === "staff" && (!staffs[member.user.id] && member.user.id !== this.client.config.general.ownerId)) return;

                categories.push(command.help.category);
            }
        });

        categories.sort();


        // fix deprecated shit
        let row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId(member.user.id + '_helpmenu')
                    .setPlaceholder(guild.translate("misc/help:main:placeholder"))
            )
        let sortedCategories = [];

       for(let category of categories){
           let emoji = this.client.emojis.cache.find((emoji) => emoji.toString() === this.client.emotes.categories[category]);
           row.components[0].addOptions([
               {
                   label: guild.translate("misc/help:main:categoriesList:" + category),
                   value: member.user.id + '_' + category,
                   emoji: {
                       animated: emoji.animated,
                       id: emoji.id,
                       name: emoji.name
                   }
               }
           ]);
            sortedCategories.push(this.client.emotes.categories[category] + ' **' + guild.translate("misc/help:main:categoriesList:" + category) + '**');
        }

       let commandIds = [];
       let fetchedCommands = await this.client.application.commands.fetch().catch(() => {});
       if(fetchedCommands) fetchedCommands.forEach((command) => commandIds.push({ name: command.name, id: command.id }));

        let news = JSON.parse(fs.readFileSync('./storage/news.json'))
        let mainEmbed = new EmbedBuilder()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(desc)
            .setColor(this.client.embedColor)
            .setThumbnail(this.client.user.displayAvatarURL())
            .addFields([
                {
                    name:
                        guild.translate("misc/help:main:categories"),
                    value:
                        guild.translate("misc/help:main:categories_value").replace('{categories}', sortedCategories.join('\n')),
                    inline: true
                },
                {
                    name:
                        guild.translate("misc/help:main:news:title")
                            .replace('{date}', moment.tz(new Date(news.timestamp), guild.translate("language:timezone")).format(guild.translate("language:onlyDateFormat"))),
                    value:
                        guild.translate("misc/help:main:news:news")
                            .replace('{news}', news.text),
                    inline: true
                }
            ])
            .setFooter({text: guild.translate("misc/help:main:footer")});

        let sent = await interaction.send(mainEmbed, false, [row]);
        if(!sent) return;
        const collector = sent.createMessageComponentCollector({
            filter: (i) => i.customId === member.user.id + '_helpmenu',
        });

        collector.on("collect", async (chooseCategory) => {
            if(chooseCategory.customId !== chooseCategory.user.id + '_helpmenu') return;
            await this.client.wait(500);
            let currentIndex = 0;
            let category = chooseCategory.values[0].split('_')[1];
            let commands = this.client.commands.filter((command) => command.help.category === category);


            let backId = member.user.id + '_back';
            let forwardId = member.user.id + '_forward';
            let homeId = member.user.id + '_home';

            let backButton = new ButtonBuilder({
                style: ButtonStyle.Secondary,
                label: guild.translate("language:labels:back"),
                emoji: this.client.emotes.arrow_left,
                custom_id: backId
            });

            let forwardButton = new ButtonBuilder({
                style: ButtonStyle.Secondary,
                label: guild.translate("language:labels:forward"),
                emoji: this.client.emotes.arrow_right,
                custom_id: forwardId
            });

            let homeButton = new ButtonBuilder({
                style: ButtonStyle.Primary,
                label: guild.translate("misc/help:main:home"),
                emoji: this.client.emotes.home,
                custom_id: homeId
            });

            const cmds = [... commands.values()];
            let disabledCommands = JSON.parse(fs.readFileSync('./storage/disabledcmds.json'));
            let generateEmbed = async start => {
                let current = cmds.slice(start, start + 5);
                if(current.length === 0) current = [guild.translate("language:error")]

                let pagesTotal = Math.round(cmds.length / 5);
                if(pagesTotal === 0) pagesTotal = 1;
                let currentPage = Math.round(start / 5) + 1;

                let text =  '{text}'.replace('{text}',
                    current.map(cmd => (
                        ((cmd === guild.translate("language:error") ? guild.translate("language:error")
                            .replace('{emotes.error}', this.client.emotes.error)
                            .replace('{support}', this.client.supportUrl) : (disabledCommands.includes(cmd.help.name) ? this.client.emotes.error : this.client.emotes.arrow) + ' **' + (disabledCommands.includes(cmd.help.name) ? '~~' + ('</' + commandIds.find((s) => s.name === cmd.help.name).name + ':' + commandIds.find((s) => s.name === cmd.help.name).id + '>') + '~~' : '</' + commandIds.find((s) => s.name === cmd.help.name).name + ':' + commandIds.find((s) => s.name === cmd.help.name).id + '>') + '**' +
                            '\n» ' + (disabledCommands.includes(cmd.help.name) ? '~~' : '') + guild.translate(cmd.help.description).replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '') + (disabledCommands.includes(cmd.help.name) ? '~~' : '') + '\n\n'))

                    )).join(''));

                return new EmbedBuilder()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setTitle(guild.translate("misc/help:main:showing")
                        .replace('{page}', currentPage)
                        .replace('{pages}', pagesTotal)
                        .replace('{category}', this.client.emotes.categories[category] + ' ' + guild.translate("misc/help:main:categoriesList:" + category)))
                    .setDescription(text)
                    .setColor(this.client.embedColor)
                    .setFooter({text: this.client.footer});
            }

            const canFitOnePage = cmds.length <= 5;
            await chooseCategory.update({
                embeds : [await generateEmbed(0)],
                components: canFitOnePage
                    ? [new ActionRowBuilder({components: [homeButton]})]
                    : [new ActionRowBuilder({components: [forwardButton, homeButton]})]
            })
            if(canFitOnePage) return;

            const collector2 = sent.createMessageComponentCollector({
                filter: ({user}) => user.id === member.user.id
            });

            currentIndex = 0;

            collector2.on('collect', async (collectPagination) => {
                if(collectPagination.customId === backId || collectPagination.customId === forwardId){
                    collectPagination.customId === backId ? (currentIndex -= 5) : (currentIndex += 5);

                    await collectPagination.deferUpdate().catch(() => {});
                    await sent.edit({
                        embeds: [await generateEmbed(currentIndex)],
                        components: [
                            new ActionRowBuilder({
                                components: [
                                    ...(currentIndex ? [backButton] : []),
                                    ...(currentIndex + 5 < cmds.length ? [forwardButton] : []),
                                    homeButton
                                ]
                            })
                        ]
                    });
                }
            });

            const homeCollector = sent.createMessageComponentCollector({
                filter: (i) => i.customId === member.user.id + '_home',
            });

            homeCollector.on("collect", async (homeInteraction) => {
                if(homeInteraction.customId !== homeInteraction.user.id + '_home') return;
                commands = [];
                collector2.stop();
                await homeInteraction.deferUpdate().catch(() => {});
                sent.edit({
                   embeds: [mainEmbed],
                   components: [row]
                });
                currentIndex = 0;
            });
        })
    }
}

module.exports = Help;
