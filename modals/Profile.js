const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    },
    avatar: {
        type: String,
    },
    data: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = User = mongoose.model('user', ProfileSchema);
