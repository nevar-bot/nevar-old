const moment = require("moment/moment");
module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(oldGuildScheduledEvent, newGuildScheduledEvent) {
        if(!oldGuildScheduledEvent || !newGuildScheduledEvent || !newGuildScheduledEvent.guild) return;
        const { guild } = newGuildScheduledEvent;

        const changes = [];
        if(oldGuildScheduledEvent.name !== newGuildScheduledEvent.name) changes.push(this.client.emotes.edit + " Name von **" + oldGuildScheduledEvent.name + "** auf **" + newGuildScheduledEvent.name + "** geändert");
        if(oldGuildScheduledEvent.description !== newGuildScheduledEvent.description) changes.push(this.client.emotes.text + " Beschreibung auf **" + newGuildScheduledEvent.description + "** geändert");
        if(oldGuildScheduledEvent.scheduledStartTimestamp !== newGuildScheduledEvent.scheduledStartTimestamp) changes.push(this.client.emotes.reminder + " Startzeitpunkt auf **" + (newGuildScheduledEvent.scheduledStartTimestamp ? moment(newGuildScheduledEvent.scheduledStartTimestamp).format("DD.MM.YYYY HH:mm") : "/") + "** geändert");
        if(oldGuildScheduledEvent.scheduledEndTimestamp !== newGuildScheduledEvent.scheduledEndTimestamp) changes.push(this.client.emotes.reminder + " Endzeitpunkt auf **" + (newGuildScheduledEvent.scheduledEndTimestamp ? moment(newGuildScheduledEvent.scheduledEndTimestamp).format("DD.MM.YYYY HH:mm") : "/") + "** geändert");

        const logText =
            " ** " + newGuildScheduledEvent.name + " wurde bearbeitet**\n\n" +
            this.client.emotes.arrow + " **Durchgeführte Änderungen:** \n" + changes.join("\n");

        if(changes.length === 0) return;

        return guild.logAction(logText, "guild", this.client.emotes.events.event.update, "normal", newGuildScheduledEvent.coverImageURL());
    }
}