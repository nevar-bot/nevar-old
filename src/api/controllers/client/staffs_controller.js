const mongoose = require("mongoose");

async function get(req, res) {
    const { app } = req;
    const { client } = require("@src/app");

    const staffs = [];
    for(let ownerId of client.config.general["OWNER_IDS"]){
        const user = await client.users.fetch(ownerId).catch(() => {});
        if(!user) continue;
        staffs.push({
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.displayAvatarURL(),
            id: user.id
        });
    }

    const staffsData = (await (await mongoose.connection.db.collection("users")).find({ "staff.state": true }).toArray());

    for(let staffData of staffsData){
        const user = await client.users.fetch(staffData.id).catch(() => {});
        if(!user) continue;
        if(staffs.find((s) => s.id === user.id)) continue;
        staffs.push({
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.displayAvatarURL(),
            id: user.id
        });
    }

    const json = {
        status_code: 200,
        status_message: null,
        res: {
            staff_count: staffs.length,
            staffs
        }
    }
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(json, null, 4));
}

module.exports = { get };