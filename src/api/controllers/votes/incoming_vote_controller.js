const fs = require("fs");
const moment = require("moment");

async function post(req, res){
    const { app } = req;
    const { client } = require("@src/app");

    const authorizationHeader = req.headers?.authorization;
    if(!authorizationHeader) return res.sendStatus(401);

    if(authorizationHeader === client.config.apikeys["DBL_WEBHOOK_AUTH"]){
        const userId = req.body.id;
        if(!userId) return res.sendStatus(400);

        const user = await client.users.fetch(userId).catch(() => {});
        if(!user) return res.sendStatus(400);

        const supportGuild = client.guilds.cache.get(client.config.support["ID"]);
        if(!supportGuild) return res.sendStatus(500);

        const supportGuildData = await client.findOrCreateGuild({id: supportGuild.id});
        if(!supportGuildData) return res.sendStatus(500);

        const userData = await client.findOrCreateUser({ id: userId });
        if(!userData.voteCount) userData.voteCount = 0;
        userData.voteCount = userData.voteCount + 1;
        userData.markModified("voteCount");
        await userData.save();
        const voteCount = userData ? userData.voteCount : null;
        const text =
            "**" + user.tag + "** hat gerade " + (voteCount ? "zum " + voteCount + ". Mal " : "") + "für uns gevotet!\n" +
            client.emotes.arrow + " Auf **[discordbotlist.com](https://discordbotlist.com/bots/" + client.user.id + "/upvote)** könnt ihr alle 12 Stunden für Nevar voten.";
        const voteEmbed = client.createEmbed(text, "shine", "normal");
        voteEmbed.setThumbnail(user.displayAvatarURL());

        const voteNowButton = client.createButton(null, "Jetzt voten", "Link", "rocket", false, "https://discordbotlist.com/bots/" + client.user.id + "/upvote");
        const buttonRow = client.createMessageComponentsRow(voteNowButton);

        await client.channels.cache.get(client.config.channels["VOTE_ANNOUNCEMENT_ID"]).send({embeds: [voteEmbed], components: [buttonRow]}).catch((e) => {console.log("Couldn't send vote announcement: " + e)});

        const voteObj = JSON.parse(fs.readFileSync('./assets/votes.json'));

        const months = moment.months();
        const month = months[(new Date(Date.now()).getMonth())];

        voteObj[month.toLowerCase()] = voteObj[month.toLowerCase()] + 1;
        fs.writeFileSync('./assets/votes.json', JSON.stringify(voteObj, null, 4));
        return res.sendStatus(200);
    }
    return res.sendStatus(401);
}

module.exports = { post };