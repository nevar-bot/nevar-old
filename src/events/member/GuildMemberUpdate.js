module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async dispatch(oldMember, newMember) {
        if(oldMember.pending && !newMember.pending) this.client.emit("guildMemberAdd", newMember);

        if(!oldMember || !newMember || !newMember.guild) return;
        const { guild } = newMember;
        if(!guild.members.cache.find((m) => m.id === oldMember.id)) return;
        
        const changes = [];
        if(oldMember.nickname !== newMember.nickname) changes.push(this.client.emotes.edit + " Nickname von **" + oldMember.displayName + "** auf **" + newMember.displayName + "** geändert");

        newMember.roles.cache.forEach((role) => {
            if(!oldMember.roles.cache.has(role.id)) changes.push(this.client.emotes.events.role.create + " " + role.toString() + " Rolle hinzugefügt");
        });

        oldMember.roles.cache.forEach((role) => {
            if(!newMember.roles.cache.has(role.id)) changes.push(this.client.emotes.events.role.delete + " " + role.toString() + " Rolle entfernt");
        })

        const logText =
            " ** " + newMember.toString() + " wurde bearbeitet**\n\n" +
            this.client.emotes.arrow + " **Durchgeführte Änderungen:** \n" + changes.join("\n");

        if(changes.length === 0) return;

        return guild.logAction(logText, "member", this.client.emotes.events.member.update, "normal", newMember.user.displayAvatarURL({ dynamic: true }));
    }
}