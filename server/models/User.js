const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    status:{
        type: String,
        enum: ['active' , 'inactive' , 'suspended'],
        default: 'inactive'
    },
    role:{
        type: String,
        enum: ['user', 'admin' ],
        default: 'user'
    },
    lastLogin: {
        type: Date,
    },
    pfpUrl:{
        type: String,
    },
    numTel:{
        type: String,
        validate: {
            validator: function(v) {
                return /^\+[1-9]\d{1,14}$/.test(v);
            },
        }
    },
    address:{
        type: String,
        maxlength: 40
    },
    googleId:{
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetToken:{
        type:String,
    },
    resetTokenExpiry:{
        type:Date,
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;