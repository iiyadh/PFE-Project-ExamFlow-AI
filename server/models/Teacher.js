const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    plan:{
        type: String,
        enum: ['basic', 'pro'],
    },
    dateEndPlan: {
        type: Date,
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;