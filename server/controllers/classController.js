const Class = require('../models/Class');

const createClass = async (req, res) => {
    try {
        const { title, subtitle, color, description, teacherId } = req.body;
        const newClass = new Class({
            title,
            subtitle,
            color,
            description,
            teacher: teacherId
        });
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (error) {
        res.status(500).json({ message: 'Error creating class', error });
    }
};



// To fix : 
// issues : * associate user as teacher / * send user id instead of teacher id 
// possible solution : add user page to allow user to select plan to be a teacher 
const getClassesByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const classes = await Class.find({ teacher: teacherId });
        res.status(200).json(classes);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching classes', error });
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
        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting class', error });
    }
};

module.exports = {
    createClass,
    getClassesByTeacher,
    updateClass,
    deleteClass
};