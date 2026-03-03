const Class = require('../models/Class');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Course = require('../models/Course');
const File = require('../models/File');

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
        
        const students = await Student.find({ classes: classId });
        for (let student of students) {
            student.classes.pull(classId);
            await student.save();
        }
        
        const studentsWithRequests = await Student.find({ requests: classId });
        for (let student of studentsWithRequests) {
            student.requests.pull(classId);
            await student.save();
        }
        
        for (let courseId of deletedClass.courses) {
            await File.deleteMany({ course: courseId });
            await Course.findByIdAndDelete(courseId);
        }
        
        for (let fileId of deletedClass.files) {
            await File.findByIdAndDelete(fileId);
        }

        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting class', error });
    }
};


const searchStudents = async (req, res) => {
    try {
        const { cid, query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }

        const classToJoin = await Class.findById(cid);
        if (!classToJoin) {
            return res.status(404).json({ message: "Class not found" });
        }
        const studentsInClass = await Student.find({
            $or: [
                { classes: cid },
                { requests: cid }
            ]
        }).select('_id');

        const excludedIds = [
            ...classToJoin.sentRequests.map(id => id.toString()),
            ...studentsInClass.map(s => s._id.toString())
        ];

        const students = await Student.find({
            _id: { $nin: excludedIds }
        }).populate({
            path: "user",
            match: {
                username: { $regex: query, $options: "i" }
            },
            select: "username pfpUrl"
        });
        const filteredStudents = students.filter(student => student.user);

        res.status(200).json(filteredStudents);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error searching students" });
    }
};

const fetchJoinRequests = async (req, res) => {
    try {
        const { classId } = req.params;
        const students = await Class.findById(classId).populate('sentRequests', 'user');
        let requests = [];
        for (let student of students.sentRequests) {
            const user = await User.findById(student.user).select('username pfpUrl');
            requests.push({ _id: student._id, user });
        };
        res.status(200).json(requests);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching join requests', error });
    }
};

const sendJoinRequest = async (req, res) => {
    try {
        const { cid , sid } = req.body;
        const student = await Student.findById(sid);
        const classToJoin = await Class.findById(cid);
        if (!student || !classToJoin) {
            return res.status(404).json({ message: 'Student or Class not found' });
        }
        if (student.requests.includes(cid) || student.classes.includes(cid)) {
            return res.status(400).json({ message: 'Already requested or joined this class' });
        }
        classToJoin.sentRequests.push(student._id);
        student.requests.push(cid);
        await classToJoin.save();
        await student.save();
        res.status(200).json({ message: 'Join request sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending join request', error });
    }
};

const denyJoinRequest = async (req, res) => {
    try {
        const { cid , sid } = req.body;
        const student = await Student.findById(sid);
        const classToJoin = await Class.findById(cid);
        if (!student || !classToJoin) {
            return res.status(404).json({ message: 'Student or Class not found' });
        }
        classToJoin.sentRequests.pull(student._id);
        student.requests.pull(cid);
        await classToJoin.save();
        await student.save();
        res.status(200).json({ message: 'Join request denied successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error denying join request', error });
    }
};



module.exports = {
    createClass,
    getClassesByTeacher,
    updateClass,
    deleteClass,
    getClassesByStudent,
    searchStudents,
    fetchJoinRequests,
    sendJoinRequest,
    denyJoinRequest
};