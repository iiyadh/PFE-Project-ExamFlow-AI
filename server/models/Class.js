const mongoose = require('mongoose');


const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    level: {
        type: String
    },
    academicYear: {
        type: String
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
}, { timestamps: true });
const Class = mongoose.model('Class', classSchema);
module.exports = Class;