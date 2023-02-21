const fs = require("fs");
const moment = require("moment");

exports.handleVote = async function(req, res) {
    const { client } = require("@src/app");

    let authorizationHeader = req.headers?.authorization;
    if(!authorizationHeader) return res.sendStatus(401);

    if(authorizationHeader === client.config.apikeys["DBL_WEBHOOK_AUTH"]){

        let userId = req.body.id;
        if(!userId) return res.sendStatus(400);

        let user = await client.users.fetch(userId).catch(() => {});
        if(!user) return res.sendStatus(400);

        let supportGuild = client.guilds.cache.get(client.config.support.id);
        if(!supportGuild) return res.sendStatus(500);

        let supportGuildData = await client.findOrCreateGuild({id: supportGuild.id});
        if(!supportGuildData) return res.sendStatus(500);

        const text =
            "**" + user.tag + "** hat gerade für uns gevotet!\n" +
            client.emotes.arrow + " Auf **[discordbotlist.com](https://discordbotlist.com/bots/" + client.user.id + "/upvote)** könnt ihr alle 12 Stunden für Nevar voten.";
        const voteEmbed = client.generateEmbed(text, "shine", "normal");
        voteEmbed.setThumbnail(user.displayAvatarURL());

        const voteNowButton = client.createButton(null, "Jetzt voten", "Link", this.client.emotes.rocket, "https://discordbotlist.com/bots/" + client.user.id + "/upvote");
        const buttonRow = client.createComponentsRow(voteNowButton);

        await client.channels.cache.get(client.config.channels["VOTE_ANNOUNCEMENT_ID"]).send({embeds: [voteEmbed], components: [buttonRow]}).catch(() => {});

        const voteObj = JSON.parse(fs.readFileSync('./storage/votes.json'));

        const months = moment.months();
        const month = months[(new Date(Date.now()).getMonth())];

        voteObj[month.toLowerCase()] = voteObj[month.toLowerCase()] + 1;
        fs.writeFileSync('./assets/votes.json', JSON.stringify(voteObj, null, 4));
        return res.sendStatus(200);
    }
    return res.sendStatus(401);
}