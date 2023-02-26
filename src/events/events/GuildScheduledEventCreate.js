const moment = require("moment/moment");
module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(guildScheduledEvent) {
        if(!guildScheduledEvent || !guildScheduledEvent.guild) return;
        const { guild } = guildScheduledEvent;

        const logText =
            " ** " + guildScheduledEvent.name + " wurde erstellt**\n\n" +
            this.client.emotes.edit + " Name: **" + guildScheduledEvent.name + "**\n" +
            this.client.emotes.id + " ID: **" + guildScheduledEvent.id + "**\n" +
            this.client.emotes.text + " Beschreibung: **" + guildScheduledEvent.description + "**\n" +
            this.client.emotes.reminder + " Startet am: **" + (guildScheduledEvent.scheduledStartTimestamp ? moment(guildScheduledEvent.scheduledStartTimestamp).format("DD.MM.YYYY HH:mm") : "Kein Startzeitpunkt angegeben") + "**\n" +
            this.client.emotes.reminder + " Endet am: **" + (guildScheduledEvent.scheduledEndTimestamp ? moment(guildScheduledEvent.scheduledEndTimestamp).format("DD.MM.YYYY HH:mm") : "Kein Endzeitpunkt angegeben") + "**\n";
        return guild.logAction(logText, "guild", this.client.emotes.events.event.create, "success", guildScheduledEvent.coverImageURL());
    }
}