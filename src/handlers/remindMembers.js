const moment = require("moment");

module.exports = {
    init(client){
        client.membersData.find({ "reminders.0" : { $exists: true } }).then((members) => {
            members.forEach((member) => {
                client.databaseCache.reminders.set(member.id + member.guildID, member);
            });
        });
        setInterval(async () => {
            for (const memberData of [...client.databaseCache.reminders.values()]) {
                for(let reminder of memberData.reminders){
                    if(reminder.endDate <= Date.now()){

                        const guild = client.guilds.cache.get(memberData.guildID);
                        if(!guild) continue;

                        const channel = guild.channels.cache.get(reminder.channel);
                        if(!channel) continue;

                        const member = await guild.members.fetch(memberData.id).catch((e) => {
                            client.logException(e, guild.name, null, "<Guild>.members.fetch(\"" + memberData.id + "\"");
                        });
                        if(!member) continue;

                        const reminderAgo = client.utils.getRelativeTime(reminder.startDate);
                        const reminderStarted = moment(reminder.startDate).format("DD.MM.YYYY, HH:mm");

                        const text =
                            "Hier ist deine Erinnerung, die du vor " + reminderAgo + " erstellt hast!\n" +
                            client.emotes.arrow + " Erstellt am: " + reminderStarted + "\n" +
                            client.emotes.arrow + " Erinnerung: " + reminder.reason;

                        const remindEmbed = client.generateEmbed(text, "reminder", "normal");

                        channel.send({content:member.toString(), embeds:[remindEmbed]});

                        memberData.reminders = memberData.reminders.filter((r) => r.startDate !== reminder.startDate);
                        memberData.markModified("reminders");
                        await memberData.save();
                    }
                }
            }
        }, 1000);
    }
};
