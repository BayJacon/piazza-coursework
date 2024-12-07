const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    expirationTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        default: 'Live',
    },
    likes: {
        type: Number,
        default: 0,
    },
    dislikes: {
        type: Number,
        default: 0,
    },
    comments: [
        {
            user: String,
            text: String,
            date: Date,
        },
    ],
    totalInteractions: {
        type: Number,
        default: 0,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Post', PostSchema);