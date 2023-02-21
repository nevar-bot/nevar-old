const moment = require("moment");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    init(client){
        client.membersData.find({ "reminders": Array }).then((members) => {
            members.forEach((member) => {
                client.databaseCache.reminders.set(member.id + member.guildID, member);
            });
        });
        setInterval(async () => {
            for (const memberData of [...client.databaseCache.reminders.values()]) {
                for(let reminder of memberData.reminders){
                    if(reminder.endDate <= Date.now()){
                        let guild = client.guilds.cache.get(memberData.guildID);
                        if(!guild) continue;
                        let channel = guild.channels.cache.get(reminder.channel);
                        if(!channel) continue;
                        let member = guild.members.cache.get(memberData.id);
                        if(!member) continue;
                        let guildData = await client.findOrCreateGuild({id:memberData.guildID});
                        let reminderDiff = moment.duration(moment(Date.now()).diff(reminder.startDate))._data;
                        let reminderAgo = [];
                        if(reminderDiff.years > 0)
                            reminderAgo.push(reminderDiff.years + ' ' + (reminderDiff.years > 1 ? guild.translate("timeUnits:years") : guild.translate("timeUnits:year")));
                        if(reminderDiff.months > 0)
                            reminderAgo.push(reminderDiff.months + ' ' + (reminderDiff.months > 1 ? guild.translate("timeUnits:months") : guild.translate("timeUnits:month")));
                        if(reminderDiff.days > 0)
                            reminderAgo.push(reminderDiff.days + ' ' + (reminderDiff.days > 1 ? guild.translate("timeUnits:days") : guild.translate("timeUnits:day")));
                        if(reminderDiff.hours > 0)
                            reminderAgo.push(reminderDiff.hours + ' ' + (reminderDiff.hours > 1 ? guild.translate("timeUnits:hours") : guild.translate("timeUnits:hour")));
                        if(reminderDiff.minutes > 0)
                            reminderAgo.push(reminderDiff.minutes + ' ' + (reminderDiff.minutes > 1 ? guild.translate("timeUnits:minutes") : guild.translate("timeUnits:minute")));
                        if(reminderDiff.seconds > 0)
                            reminderAgo.push(reminderDiff.seconds + ' ' + (reminderDiff.seconds > 1 ? guild.translate("timeUnits:seconds") : guild.translate("timeUnits:second")));

                        reminderAgo = reminderAgo.join(', ');
                        let started = moment.tz(new Date(reminder.startDate), guild.translate("language:timezone")).format(guild.translate("language:dateformat"));
                        let embed = new EmbedBuilder()
                            .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL(), url: client.website})
                            .setDescription(guild.translate("misc/reminder:main:over")
                                .replace('{relative}', reminderAgo)
                                .replace('{emotes.arrow}', client.emotes.arrow)
                                .replace('{startDate}', started)
                                .replace('{reason}', reminder.reason))
                            .setColor(client.embedColor)
                            .setFooter({text: client.footer});
                        channel.send({content:`${member}`, embeds:[embed]})
                        memberData.reminders = memberData.reminders.filter((r) => r.id !== reminder.id);
                        memberData.markModified("reminders");
                        await memberData.save();
                    }
                }
            }
        }, 1000);
    }
};
