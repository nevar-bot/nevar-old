const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    id: { type: String },
    bet: {
        type: Object,
        default: {
            points: 0,
            list: []
        }
    },
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
    }
})

module.exports = mongoose.model("User", Schema);