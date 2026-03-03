const Student = require('../models/Student');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const User = require('../models/User');




const fetchStudentRequests = async (req, res) => {
    try {
        const uid = req.user.id;
        const studentRequests = await Student.findOne({ user: uid }).populate('requests');
        if (!studentRequests) {
            return res.status(404).json({ message: 'Student not found' });
        }
        let requests = [];
        for (const request of studentRequests.requests) {
            const classObj = await Class.findById(request).populate('teacher','user');
            const teacher = await Teacher.findById(classObj.teacher._id).populate('user');
            requests.push({
                classId: classObj._id,
                studentId: studentRequests._id,
                className: classObj.title,
                teacherName: teacher.user.username,
                pfpUrl: teacher.user.pfpUrl
            });
        };
        res.status(200).json(requests);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const AcceptRejectRequest = async (req, res) => {
    try {
        const { studentId, classId, action } = req.body;
        const student = await Student.findById(studentId);
        const classObj = await Class.findById(classId);
        if (!student || !classObj) {
            return res.status(404).json({ message: 'Student or Class not found' });
        }
        if (action === 'accept') {
            if (!student.classes.includes(classId) && !classObj.students.includes(studentId)) {
                student.classes.push(classId);
                classObj.students.push(studentId);
            }
            student.requests = student.requests.filter(id => id.toString() !== classId);
            classObj.sentRequests = classObj.sentRequests.filter(id => id.toString() !== studentId);
            await student.save();
            await classObj.save();
            return res.status(200).json({ message: 'Request accepted' });
        } else if (action === 'reject') {
            student.requests = student.requests.filter(id => id.toString() !== classId);
            classObj.sentRequests = classObj.sentRequests.filter(id => id.toString() !== studentId);
            await student.save();
            await classObj.save();
            return res.status(200).json({ message: 'Request rejected' });
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const fetchStudentsClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const classObj = await Class.findById(classId);
        const students = [];
        for (const studentId of classObj.students) {
            const student = await Student.findById(studentId).populate('user');
            students.push({
                _id: student._id,
                username: student.user.username,
                pfpUrl: student.user.pfpUrl
            });
        }
        if (!classObj) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.status(200).json(students);
    }catch(err){
        consle.log(err);
        res.status(500).json({ message: 'Error fetching classes', error: err });
    }
};

const kickStudent = async (req, res) => {
    try {        
        const { studentId, classId } = req.body;
        const student = await Student.findById(studentId);
        const classObj = await Class.findById(classId);
        if (!student || !classObj) {
            return res.status(404).json({ message: 'Student or Class not found' });
        }
        student.classes = student.classes.filter(id => id.toString() !== classId);
        classObj.students = classObj.students.filter(id => id.toString() !== studentId);
        await student.save();
        await classObj.save();
        return res.status(200).json({ message: 'Student kicked from class' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const leaveClass = async (req, res) => {
    try {
        const { classId } = req.body;
        const uid = req.user.id;
        const student = await Student.findOne({ user: uid });
        const classObj = await Class.findById(classId);
        if (!student || !classObj) {
            return res.status(404).json({ message: 'Student or Class not found' });
        }
        student.classes = student.classes.filter(id => id.toString() !== classId);
        classObj.students = classObj.students.filter(id => id.toString() !== student._id.toString());
        await student.save();
        await classObj.save();
        return res.status(200).json({ message: 'Left class successfully' });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    AcceptRejectRequest,
    fetchStudentRequests,
    fetchStudentsClass,
    kickStudent,
    leaveClass
};