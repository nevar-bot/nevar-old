module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "giveaway";
    }

    getType(){ return this.type }

    async dispatch(giveaway, member, reaction) {
        reaction.users.remove(member.user);
    }
};
