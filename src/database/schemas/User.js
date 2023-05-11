const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    id: { type: String },
    afk: {
        type: Object,
        default: {
            state: false,
            reason: null,
            since: null
        }
    },
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
    staff: {
        type: Object,
        default: {
            state: false,
            role: null
        }
    },
    partner: {
        type: Object,
        default: {
            state: false
        }
    },
    bughunter: {
        type: Object,
        default: {
            state: false,
        }
    },

    voteCount: { type: Number, default: 0 }
})

module.exports = mongoose.model("User", Schema);