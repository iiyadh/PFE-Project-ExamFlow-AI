const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name :{
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    modifiedTime: {
        type: Date,
        required: true
    },
    size:{
        type: String,
    },
    status:{
        type: String,
        enum: ['pending', 'processing', 'converted', 'error'],
        default: 'pending'
    },
    webViewLink: {
        type: String
    },
    public_id: {
        type: String,
        required: true
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }
}, { timestamps: true });

const File = mongoose.model('File', fileSchema);
module.exports = File;