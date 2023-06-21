const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    id: { type: String },
    membersData: { type: Object, default: {} },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member"
    }],
    blocked: {
        type: Object,
        default: {
            state: false,
            reason: null,
            date: null,
            moderator: null,
            name: null,
        }
    },
    settings: {
        type: Object,
        default: {
            logs: {
                enabled: true,
                channels: {
                    moderation: null,
                    member: null,
                    guild: null,
                    role: null,
                    thread: null,
                    channel: null,
                }
            },
            joinToCreate: {
                enabled: false,
                channel: null,
                category: null,
                userLimit: null,
                bitrate: null,
                defaultName: null,
                channels: []
            },
            suggestions: {
                enabled: false,
                channel: null,
                review_channel: null
            },
            invites: {
                enabled: false,
            },
            levels: {
                enabled: false,
                channel: null,
                message: "GG {user:username}, du bist jetzt Level {level}!",
                roles: [],
                doubleXP: [],
                exclude: {
                    channels: [],
                    roles: [],
                },
                xp: {
                    min: 1,
                    max: 30
                },
            },
            welcome: {
                enabled: false,
                channel: null,
                type: null,
                color: "#5865F2",
                profilePicture: true,
                message: null,
                autoroles: [],
            },
            farewell: {
                enabled: false,
                channel: null,
                type: null,
                color: "#5865F2",
                profilePicture: true,
                message: null,
            },
            muterole: null,
            autodelete: [],
            autoreact: [],
            reactionroles: [],
        }
    }
});

module.exports = mongoose.model("Guild", Schema);