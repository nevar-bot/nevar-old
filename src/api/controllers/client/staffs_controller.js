const mongoose = require("mongoose");

async function get(req, res) {
    const { app } = req;
    const { client } = require("@src/app");

    const headStaffs = [];
    const normalStaffs = [];

    for(let ownerId of client.config.general["OWNER_IDS"]){
        const user = await client.users.fetch(ownerId).catch(() => {});
        if(!user) continue;
        headStaffs.push({
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.displayAvatarURL(),
            id: user.id,
            role: "Head-Staff"
        });
    }

    const staffsData = (await (await mongoose.connection.db.collection("users")).find({ "staff.state": true }).toArray());

    for(let staffData of staffsData){
        const user = await client.users.fetch(staffData.id).catch(() => {});
        if(!user) continue;
        if(headStaffs.find((s) => s.id === user.id)) continue;
        const staffToPush = {
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.displayAvatarURL(),
            id: user.id,
            role: staffData.staff.role === "head-staff" ? "Head-Staff" : "Staff"
        }

        if(staffData.staff.role === "head-staff") headStaffs.push(staffToPush);
        else normalStaffs.push(staffToPush);
    }

    const staffs = [...headStaffs, ...normalStaffs];

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