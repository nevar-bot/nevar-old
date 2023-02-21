const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    command: { type: String, default: "Unknown" },
    type: { type: String, default: "Unknown" },
    arguments: { type: Array, default: [] },
    date: { type: Number, default: Date.now() },
    user: {
        type: Object,
        default: {
            tag: "Unknown#0000",
            id: null,
            createdAt: { type: Number, default: Date.now() }
        }
    },
    guild: {
        type: Object,
        default: {
            name: "Unknown",
            id: null,
            createdAt: { type: Number, default: Date.now() }
        }
    },
    channel: {
        type: Object,
        default: {
            name: "Unknown",
            id: null,
            createdAt: { type: Number, default: Date.now() }
        }
    }
});

module.exports = mongoose.model("Log", Schema);