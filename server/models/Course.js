const mongoose = require('mongoose');


const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    image: {
        type: String
    },
    markdownContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MarkdownContent'
        }
    ],

}, { timestamps: true });


const Course = mongoose.model('Course', courseSchema);
module.exports = Course;