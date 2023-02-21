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
            moderator: null
        }
    },
    settings: {
        type: Object,
        default: {
            tracker: {
                enabled: true
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
            guessTheCountry: {
                enabled: false,
                channel: null
            },
            invites: {
                enabled: false,
            },
            levels: {
                enabled: false,
                channel: null,
                message: "GG {member:name}, du bist jetzt Level {level}!",
                roles: [],
                doubleXP: [],
                xp: {
                    min: 1,
                    max: 30
                },
            },
            welcome: {
                enabled: false,
                channel: null,
                type: null,
                message: null,
                autoroles: [],
            },
            farewell: {
                enabled: false,
                channel: null,
                type: null,
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