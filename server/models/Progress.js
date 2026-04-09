const mongoose = require('mongoose');



const progressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    visitedModules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MarkdownContent'
    }],
    lastAccessed: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });



const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;