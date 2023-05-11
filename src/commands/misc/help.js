const BaseCommand = require('@structures/BaseCommand');
const { ActionRowBuilder, SlashCommandBuilder, ComponentType, StringSelectMenuBuilder } = require('discord.js');
const moment = require('moment');
const fs = require("fs");

function getKeyByValue(object, value){
    return Object.keys(object).find(key => object[key] === value);
}

class Help extends BaseCommand {

    constructor(client) {
        super(client, {
            name: "help",
            description: "Sendet eine Übersicht aller Befehle, oder Hilfe zu einem bestimmten Befehl",

            cooldown: 3000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option => option
                        .setName("befehl")
                        .setDescription("Gib einen Befehl an, zu dem du Hilfe benötigst")
                        .setRequired(false)
                    )
            }
        });
    }

    static interaction;
    async dispatch(interaction, data) {
        this.interaction = interaction;

        if(interaction.options.getString("befehl")){
            await this.showHelpForCommand(interaction.options.getString("befehl"));
        }else{
            await this.showHelp(data);
        }
    }

    async showHelp(data){
        // Get all categories
        const categoriesList = [];

        const categories = {
            "administration": "Administration",
            "fun": "Fun",
            "minigames": "Minispiele",
            "misc": "Sonstiges",
            "moderation": "Moderation",
            "owner": "Owner",
            "staff": "Staff"
        }

        // Create a category list
        for(let command of this.client.commands) {
            if (!categoriesList.includes(categories[command[1].help.category])) {
                categoriesList.push(categories[command[1].help.category]);
            }
        }

        // Create the link section of the embed
        const links =
            this.client.emotes.discord + "**[SUPPORT](" + this.client.config.support["INVITE"] + ")** | " +
            this.client.emotes.growth_up + "**[EINLADEN](" + this.client.createInvite() + ")** |" +
            this.client.emotes.globe + "**[WEBSITE](" + this.client.config.general["WEBSITE"] + ")** | " +
            this.client.emotes.gift + " **[UNTERSTÜTZEN](https://prohosting24.de/cp/donate/nevar)**";

        // Create the description section of the embed
        const description =
            this.client.emotes.arrow + " Hier findest du alle Befehle, die ich aktuell anbiete. Wähle unten einfach eine Kategorie, um eine entsprechende Liste zu erhalten."

        // Create the news section of the embed
        const newsJson = JSON.parse(fs.readFileSync("./assets/news.json"));
        const newsDate = moment(newsJson.timestamp).format("DD.MM.YYYY")
        const news = this.client.emotes.new + " **Neues vom " + newsDate + ":**\n" + newsJson.text

        // Create the embed
        const helpEmbed = this.client.createEmbed("{0}\n\n{1}\n\n{2}", null, "normal", links, description, news);

        // Create the category select menu
        const categoryStringSelectMenu = new StringSelectMenuBuilder()
            .setCustomId("category_select")
            .setPlaceholder("Wähle eine Kategorie");

        // Add the categories to the select menu
        for(let category of categoriesList){
            if(category === "Staff" && !data.user.staff.state && !this.client.config.general["OWNER_IDS"].includes(this.interaction.user.id)) continue;
            if(category === "Owner" && data.user.staff.role !== "head-staff" && !this.client.config.general["OWNER_IDS"].includes(this.interaction.user.id)) continue;
            categoryStringSelectMenu.addOptions({
                label: category,
                emoji: this.client.emotes.slashcommand,
                value: category,
            });
        }

        // Create the action row
        const categoryActionRow = new ActionRowBuilder()
            .addComponents(categoryStringSelectMenu);

        // Send the embed with the select menu
        const helpEmbedSent = await this.interaction.followUp({ embeds: [helpEmbed], components: [categoryActionRow], fetchReply: true });

        // Create collector for the select menu
        const categoryCollector = await helpEmbedSent.createMessageComponentCollector({ filter: i => i.user.id === this.interaction.user.id, componentType: ComponentType.SelectMenu });

        categoryCollector.on("collect", async (categoryInteraction) => {
            // Get selected category
            const category = getKeyByValue(categories, categoryInteraction.values[0]);

            // Get all commands of the selected category
            let commands = this.client.commands.filter((command) => command.help.category === category);
            let commandsArray = [...commands.values()];

            // Get all disabled commands
            const disabledCommands = JSON.parse(fs.readFileSync("./assets/disabled.json"));

            // Get all application commands
            const commandIds = [];
            const fetchedCommands = (await this.client.application.commands.fetch().catch(() => {})).filter(c => c.type === 1);
            if(fetchedCommands) fetchedCommands.forEach((command) => commandIds.push({ name: command.name, id: command.id }));

            let formattedCommands = [];
            for(let command of commandsArray){

                const commandId = commandIds.find((s) => s.name === command.help.name)?.id;
                const availableAsSlashCommand = !!commandId;
                const isDisabled = disabledCommands.includes(command.help.name);
                const commandMentionString = availableAsSlashCommand ? "</" + command.help.name + ":" + commandId + ">" : command.help.name;

                const text =
                    (isDisabled ? this.client.emotes.error + " ~~" + commandMentionString + "~~" : this.client.emotes.slashcommand + " " + commandMentionString) + "\n" + this.client.emotes.text + " " + command.help.description + "\n";

                formattedCommands.push(text);
            }

            let currentIndex = 0;
            const backId = this.interaction.user.id + "_back";
            const forwardId = this.interaction.user.id + "_forward";
            const homeId = this.interaction.user.id + "_home";

            const backButton = this.client.createButton(backId, "Zurück", "Secondary", this.client.emotes.arrows.left);
            const forwardButton = this.client.createButton(forwardId, "Weiter", "Secondary", this.client.emotes.arrows.right);
            const homeButton = this.client.createButton(homeId, "Zur Startseite", "Primary", "discover");

            const generateEmbed = async (start) => {
                let current = formattedCommands.slice(start, start +5);

                const pages = {
                    total: Math.ceil(commandsArray.length / 5),
                    current: Math.round(start / 5) + 1
                };
                if(pages.total === 0) pages.total = 1;

                const text = current.map(item => "\n" + item).join("");
                const paginatedEmbed = this.client.createEmbed(text, null, "normal");
                paginatedEmbed.setTitle(categories[category] + " ● Seite " + pages.current + " von " + pages.total);
                paginatedEmbed.setThumbnail(this.interaction.guild.iconURL({ dynamic: true, size: 4096 }));
                return paginatedEmbed;
            }

            const canFitOnePage = formattedCommands.length <= 5;
            await categoryInteraction.update({
                embeds : [await generateEmbed(0)],
                components: canFitOnePage
                    ? [new ActionRowBuilder({components: [homeButton]})]
                    : [new ActionRowBuilder({components: [forwardButton, homeButton]})]
            })
            if(canFitOnePage) return;

            const paginationCollector = helpEmbedSent.createMessageComponentCollector({ filter: i => i.user.id === this.interaction.user.id, componentType: ComponentType.Button });

            currentIndex = 0;

            paginationCollector.on('collect', async (paginationInteraction) => {
                if(paginationInteraction.customId === backId || paginationInteraction.customId === forwardId){
                    paginationInteraction.customId === backId ? (currentIndex -= 5) : (currentIndex += 5);

                    await paginationInteraction.deferUpdate().catch(() => {});
                    await helpEmbedSent.edit({
                        embeds: [await generateEmbed(currentIndex)],
                        components: [
                            new ActionRowBuilder({
                                components: [
                                    ...(currentIndex ? [backButton] : []),
                                    ...(currentIndex + 5 < formattedCommands.length ? [forwardButton] : []),
                                    homeButton
                                ]
                            })
                        ]
                    });
                }
            });

            const homeCollector = helpEmbedSent.createMessageComponentCollector({
                filter: (i) => i.customId === this.interaction.user.id + '_home',
            });

            homeCollector.on("collect", async (homeInteraction) => {
                if(homeInteraction.customId !== homeInteraction.user.id + '_home') return;
                commands = [];
                commandsArray = [];
                formattedCommands = [];
                paginationCollector.stop();
                await homeInteraction.deferUpdate().catch(() => {});
                await helpEmbedSent.edit({
                    embeds: [helpEmbed],
                    components: [categoryActionRow]
                });
                currentIndex = 0;
            });
        });
    }

    async showHelpForCommand(command){
        const categories = {
            "administration": "Administration",
            "fun": "Fun",
            "minigames": "Minispiele",
            "misc": "Sonstiges",
            "moderation": "Moderation",
            "owner": "Owner",
            "staff": "Staff"
        }
        const clientCommand = this.client.commands.find((c) => c.help.name === command);
        if(clientCommand){
            let helpString =
                this.client.emotes.text + " **" + clientCommand.help.description + "**\n\n" +
                this.client.emotes.timeout + " **Cooldown:** " + clientCommand.conf.cooldown / 1000 + " Sekunde(n)\n" +
                this.client.emotes.underage + " **NSFW:** " + (clientCommand.conf.nsfw ? "Ja" : "Nein") + "\n\n";

            if(clientCommand.conf.memberPermissions.length > 0){
                helpString += this.client.emotes.user + " **Benötigte Rechte (Nutzer):** \n" + clientCommand.conf.memberPermissions.map((p) => this.client.emotes.arrow + " " + this.client.permissions[p]).join("\n") + "\n\n";
            }

            if(clientCommand.conf.botPermissions.length > 0){
                helpString += this.client.emotes.bot + " **Benötigte Rechte (Bot):** \n" + clientCommand.conf.botPermissions.map((p) => this.client.emotes.arrow + " " + this.client.permissions[p]).join("\n") + "\n\n";
            }

            if(clientCommand.conf.ownerOnly){
                helpString += this.client.emotes.crown + " **Nur für " + this.client.user.username + "-Entwickler:** Ja\n\n";
            }

            if(clientCommand.conf.staffOnly){
                helpString += this.client.emotes.users + " **Nur für " + this.client.user.username + "-Staffs:** Ja\n\n";
            }

            const helpEmbed = this.client.createEmbed(helpString, null, "normal");

            helpEmbed.setTitle(" Hilfe für den " + clientCommand.help.name.slice(0, 1).toUpperCase() + clientCommand.help.name.slice(1) + " Befehl (" + categories[clientCommand.help.category] + ")");
            helpEmbed.setThumbnail(this.interaction.guild.iconURL({ dynamic: true, size: 4096 }));

            return this.interaction.followUp({ embeds: [helpEmbed] });

        }else{
            const userData = await this.client.findOrCreateUser({ id: this.interaction.user.id });
            await this.showHelp({
                user: userData
            });
        }
    }
}

module.exports = Help;
