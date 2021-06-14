const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//even user delete their account, their posts can still keep in database, so I need "name" and "avatar" fields

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    text: {
        type: String,
        required: true,
    },
    name: {
        type: String,
    },
    avatar: {
        type: String,
    },
    likes: [
        {
            user: {
                //where likes come from, and limited user's like only one
                type: Schema.Types.ObjectId,
                ref: 'users',
            },
        },
    ],
    comments: [
        {
            user: {
                //where likes come from, and limited user's like only one
                type: Schema.Types.ObjectId,
                ref: 'users',
            },
            text: {
                type: String,
                required: true,
            },
            name: {
                type: String,
            },
            avatar: {
                type: String,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

module.exports = Post = mongoose.model('post', PostSchema);
