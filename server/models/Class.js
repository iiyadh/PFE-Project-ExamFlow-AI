const mongoose = require('mongoose');


const classSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String
    },
    color: {
        type: String
    },
    description:{
        type: String
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);
module.exports = Class;