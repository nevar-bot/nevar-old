const Levels = require("discord-xp");
const axios = require('axios');

module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "giveaway";
    }

    getType(){
        return this.type;
    }

    async dispatch(giveaway, member, reaction) {
        let conditions = giveaway.extraData.requirement;

        if(conditions.raw.split('_')[0] !== 'none'){
            if(conditions.int === 2){
                let roleId = conditions.raw.split('_')[1];
                if(!member.roles.cache.get(roleId)){
                    reaction.users.remove(member.user);
                }
            }
            if(conditions.int === 3){
                let neededLevel = parseInt(conditions.raw.split('_')[1]);
                let bot = conditions.raw.split('_')[2];
                if(bot === this.client.user.username){
                    // Get the user's level from database
                    let levelUser = await Levels.fetch(member.user.id, member.guild.id, true)
                    if(parseInt(levelUser.level) < neededLevel){
                        reaction.users.remove(member.user);
                    }
                }
                if(bot === 'MEE6'){
                    // TODO: add MEE6 level support if there should ever be a public API..
                    return;
                }
                if(bot === 'Amari'){
                    // Get the user's level from the Amari API
                    let json = (await axios.get('https://amaribot.com/api/v1/guild/' + member.guild.id + '/member/' + member.user.id, {
                        headers: {
                            Authorization: this.client.config.apikeys.amari
                        },
                        validateStatus: false
                    })).data

                    let level = 0;
                    if(json?.error?.startsWith('Unable to find the requested') || json?.error === 'Unauthorized')
                        return;
                    else
                        level = json?.level;
                    if(level < neededLevel){
                        reaction.users.remove(member.user);
                    }
                }
            }
            if(conditions.int === 4){
                let neededDays = conditions.raw.split('_')[1];
                let oneDay = 24 * 60 * 60 * 1000;

                let startDate = new Date(member.joinedAt);
                let endDate = new Date(Date.now());

                let days = parseInt(Math.round(Math.abs((startDate - endDate) / oneDay)));
                if(days < neededDays){
                    reaction.users.remove(member.user);
                }
            }
        }
    }
};
