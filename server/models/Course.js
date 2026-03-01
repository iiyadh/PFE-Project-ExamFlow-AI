const mongoose = require('mongoose');


const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    class:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    originalFileUrl: {
        type: String
    },
    fileType: {
        type: String,
        enum: ['PDF', 'DOCX']
    },
    markdownContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MarkdownContent'
        }
    ],
    structuredContent: {
        type: Object
    },
    status: {
        type: String,
        enum: ['UPLOADED', 'PROCESSING', 'CONVERTED', 'FAILED'],
        default: 'UPLOADED'
    },
    fileSize: {
        type: Number
    },

    // 🧠 AI Enhancements (Jury Impact)
    aiSummary: {
        type: String
    },
    extractedHeadings: [{
        type: String
    }],
    estimatedReadingTime: {
        type: Number
    }

}, { timestamps: true });


const Course = mongoose.model('Course', courseSchema);
module.exports = Course;