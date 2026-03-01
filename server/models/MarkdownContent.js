const mongoose = require('mongoose');


const markdownContentSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

const MarkdownContent = mongoose.model('MarkdownContent', markdownContentSchema);
module.exports = MarkdownContent;