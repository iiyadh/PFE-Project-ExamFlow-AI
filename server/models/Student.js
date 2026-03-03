const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    requests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }]
}, { timestamps: true });


const Student = mongoose.model('Student', studentSchema);
module.exports = Student;