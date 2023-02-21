const { readdirSync, lstatSync } = require("fs");
const { join, extname } = require("path");
const { ActionRowBuilder } = require("discord.js");
const moment = require("moment/moment");
module.exports = class Utils {
    static recursiveReadDirSync(dir, allowedExtensions = [".js"]) {
        const filePaths = [];
        const readCommands = (dir) => {
            const files = readdirSync(join(process.cwd(), dir));
            files.forEach((file) => {
                const stat = lstatSync(join(process.cwd(), dir, file));
                if (stat.isDirectory()) {
                    readCommands(join(dir, file));
                } else {
                    const extension = extname(file);
                    if (!allowedExtensions.includes(extension)) return;
                    const filePath = join(process.cwd(), dir, file);
                    filePaths.push(filePath);
                }
            });
        };
        readCommands(dir);
        return filePaths;
    }

    static formatInteger(int){
        const formatter = new Intl.NumberFormat("de-DE");
        return formatter.format(int);
    }

    static getRandomKey(length){
        let result = "";
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for(let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    static getRandomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    static stringIsUrl(str){
        const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(str);
    }

    static urlIsImage(str){
        return (str.match(/\.(jpeg|jpg|gif|png|webp)$/) != null);
    }

    static stringIsCustomEmoji(str){
        const pattern = new RegExp(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/);
        return pattern.test(str);
    }

    static async sendPaginatedEmbed(interaction, entriesPerPage, data, title, empty, emote){
        const { client } = interaction;

        const backId = interaction.member.user.id + "_back";
        const forwardId = interaction.member.user.id + "_forward";
        const backButton = client.createButton(backId, "Zurück", "Secondary", client.emotes.arrows.left, false, null);
        const forwardButton = client.createButton(forwardId, "Weiter", "Secondary", client.emotes.arrows.right, false, null);

        async function generatePaginateEmbed(start){
            const current = data.slice(start, start + entriesPerPage);
            let text = current.map(item => "\n" + (emote ? client.emotes[emote] + " " : "") + item).join("");

            const pages = {
                total: Math.ceil(data.length / entriesPerPage),
                current: Math.round(start / entriesPerPage) + 1
            };
            if(pages.total === 0) pages.total = 1;
            if(data.length === 0) text = (emote ? client.emotes[emote] + " " : "") + empty;

            const paginatedEmbed = client.generateEmbed(text, null, "normal");
            paginatedEmbed.setTitle(title + " ● Seite " + pages.current + " von " + pages.total);
            paginatedEmbed.setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 4096 }));
            return paginatedEmbed;
        }

        const fitOnePage = data.length <= entriesPerPage;

        const embedMessage = await interaction.followUp({
            embeds: [ await generatePaginateEmbed(0) ],
            components: fitOnePage ? [] : [ client.createComponentsRow(forwardButton) ]
        });

        const pageCollector = embedMessage.createMessageComponentCollector({ filter: i => i.user.id === interaction.member.user.id });
        let currentPageIndex = 0;
        pageCollector.on("collect", async (i) => {
            i.customId === backId ? (currentPageIndex -= entriesPerPage) : (currentPageIndex += entriesPerPage);
            await i.update({
                embeds: [ await generatePaginateEmbed(currentPageIndex) ],
                components: [
                    new ActionRowBuilder({
                        components: [
                            ...(currentPageIndex ? [ backButton ] : []),
                            ...(currentPageIndex + entriesPerPage < data.length ? [ forwardButton ] : [])
                        ]
                    })
                ]
            });
        })
            .on("end", async () => {
                return;
            })

    }

    static async sendPaginatedEmbedMessage(message, entriesPerPage, data, title, empty, emote){
        const { client } = message;

        const backId = message.member.user.id + "_back";
        const forwardId = message.member.user.id + "_forward";
        const backButton = client.createButton(backId, "Zurück", "Secondary", client.emotes.arrows.left, false, null);
        const forwardButton = client.createButton(forwardId, "Weiter", "Secondary", client.emotes.arrows.right, false, null);

        async function generatePaginateEmbed(start){
            const current = data.slice(start, start + entriesPerPage);
            let text = current.map(item => "\n" + (emote ? client.emotes[emote] + " " : "") + item).join("");

            const pages = {
                total: Math.ceil(data.length / entriesPerPage),
                current: Math.round(start / entriesPerPage) + 1
            };
            if(pages.total === 0) pages.total = 1;
            if(data.length === 0) text = (emote ? client.emotes[emote] + " " : "") + empty;

            const paginatedEmbed = client.generateEmbed(text, null, "normal");
            paginatedEmbed.setTitle(title + " ● Seite " + pages.current + " von " + pages.total);
            paginatedEmbed.setThumbnail(message.guild.iconURL({ dynamic: true, size: 4096 }));
            return paginatedEmbed;
        }

        const fitOnePage = data.length <= entriesPerPage;

        const embedMessage = await message.reply({
            embeds: [ await generatePaginateEmbed(0) ],
            components: fitOnePage ? [] : [ client.createComponentsRow(forwardButton) ]
        });

        const pageCollector = embedMessage.createMessageComponentCollector({ filter: i => i.user.id === message.member.user.id });
        let currentPageIndex = 0;
        pageCollector.on("collect", async (i) => {
            i.customId === backId ? (currentPageIndex -= entriesPerPage) : (currentPageIndex += entriesPerPage);
            await i.update({
                embeds: [ await generatePaginateEmbed(currentPageIndex) ],
                components: [
                    new ActionRowBuilder({
                        components: [
                            ...(currentPageIndex ? [ backButton ] : []),
                            ...(currentPageIndex + entriesPerPage < data.length ? [ forwardButton ] : [])
                        ]
                    })
                ]
            });
        })
            .on("end", async () => {
                return;
            })

    }

    static shuffleArray(array){
        return array.sort(() => Math.random() - 0.5);
    }

    static getFlagFromCountryCode(countryCode){
        return String.fromCodePoint(...[...countryCode.toUpperCase()].map(x=>0x1f1a5+x.charCodeAt()))
    }

    static stringIsEmoji(str){
        const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
        return regex.test(str);
    }

    static getRelativeTime(time){
        const momentDuration = moment.duration(moment(Date.now()).diff(time))._data;
        const relativeTime = [];
        if(momentDuration.years >= 1){
            if(relativeTime.length < 3) relativeTime.push(momentDuration.years + " " + (momentDuration.years > 1 ? "Jahre" : "Jahr"));
        }
        if(momentDuration.months >= 1){
            if(relativeTime.length < 3) relativeTime.push(momentDuration.months + " " + (momentDuration.months > 1 ? "Monate" : "Monat"));
        }
        if(momentDuration.days >= 1){
            if(relativeTime.length < 3) relativeTime.push(momentDuration.days + " " + (momentDuration.days > 1 ? "Tage" : "Tag"));
        }
        if(momentDuration.hours >= 1){
            if(relativeTime.length < 3) relativeTime.push(momentDuration.hours + " " + (momentDuration.hours > 1 ? "Stunden" : "Stunde"));
        }
        if(momentDuration.minutes >= 1){
            if(relativeTime.length < 3) relativeTime.push(momentDuration.minutes + " " + (momentDuration.minutes > 1 ? "Minuten" : "Minute"));
        }
        if(momentDuration.seconds >= 1){
            if(relativeTime.length < 3) relativeTime.push(momentDuration.seconds + " " + (momentDuration.seconds > 1 ? "Sekunden" : "Sekunde"));
        }
        if(momentDuration.milliseconds >= 1){
            if(relativeTime.length === 0) relativeTime.push(momentDuration.milliseconds + " " + (momentDuration.milliseconds > 1 ? "Millisekunden" : "Millisekunde"));
        }

        if(relativeTime.length > 1){
            return relativeTime.slice(0, -1).join(", ") + " und " + relativeTime.slice(-1)
        }else{
            return relativeTime[0];
        }
    }
}