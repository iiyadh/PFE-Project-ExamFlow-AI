const Class = require('../models/Class');
const User = require('../models/User');
const Teacher = require('../models/Teacher');

const createClass = async (req, res) => {
    try {
        const uid = req.user.id;
        const teacher = await Teacher.findOne({ user: uid });
        const { title, subtitle, color, description } = req.body;
        const newClass = new Class({
            title,
            subtitle,
            color,
            description,
            teacher: teacher._id
        });
        teacher.classes.push(newClass._id);
        await teacher.save();
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (error) {
        res.status(500).json({ message: 'Error creating class', error });
    }
};

const getClassesByTeacher = async (req, res) => {
    try{
        const uid = req.user.id;
        const classes = await Teacher.findOne({ user: uid }).populate('classes');
        if (!classes) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json(classes.classes);
    }catch(err){
        res.status(500).json({ message: 'Error fetching classes', error: err });
    }
};


const getClassesByStudent = async (req, res) => {
    try{
        const uid = req.user.id;
        const student = await User.findById(uid).populate('classes').populate("teacher").populate("user", "username pfpUrl");
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(student.classes);
    }catch(err){
        res.status(500).json({ message: 'Error fetching classes', error: err });
    }
};

const updateClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { title, subtitle, color, description } = req.body;
        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { title, subtitle, color, description },
            { new: true }
        );
        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.status(200).json(updatedClass);
    } catch (error) {
        res.status(500).json({ message: 'Error updating class', error });
    }
};

const deleteClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const deletedClass = await Class.findByIdAndDelete(classId);
        if (!deletedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        const teacher = await Teacher.findOne({ classes: classId });
        if (teacher) {
            teacher.classes.pull(classId);
            await teacher.save();
        }
        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting class', error });
    }
};

module.exports = {
    createClass,
    getClassesByTeacher,
    updateClass,
    deleteClass,
    getClassesByStudent
};