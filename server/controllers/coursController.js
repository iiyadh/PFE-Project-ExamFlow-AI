const Class = require('../models/Class');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');


const fetchCourses = async (req,res) =>{
    try{
        const {cid} = req.params;
        const classData = await Class.findById(cid).populate('courses');

        if (!classData) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.status(200).json(classData.courses || []);
    }catch(err){
        console.error('Error fetching courses:', err);
        res.status(500).json({ message: 'Error fetching courses', error: err.message });
    }
};

const editCourse = async (req,res) =>{
    try{
        const { courseId } = req.params;
        const { title, description, level, image } = req.body;
        const updatedCourse = await Course.findByIdAndUpdate(courseId, { title, description, level, image }, { new: true });
        if(!updatedCourse){
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(updatedCourse);
    }catch(err){
        console.error('Error editing course:', err);
        res.status(500).json({ message: 'Error editing course', error: err.message });
    }
};


const fetchCoursesWithChapters = async (req, res) => {
    try {
        const { cid } = req.params;
        const classData = await Class.findById(cid).populate({
            path: 'courses',
            populate: { path: 'markdownContent', select: 'title' },
        });

        if (!classData) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.status(200).json(classData.courses || []);
    } catch (err) {
        console.error('Error fetching courses with chapters:', err);
        res.status(500).json({ message: 'Error fetching courses with chapters', error: err.message });
    }
};

const fetchAllCoursesForTeacher = async (req, res) => {
    try {
        const teacherDoc = await Teacher.findOne({ user: req.user.id }).lean();
        const classIds = teacherDoc?.classes || [];

        const classes = await Class.find({ _id: { $in: classIds } }).populate({
            path: 'courses',
            populate: { path: 'markdownContent', select: 'title' },
        }).lean();

        const coursesMap = {};
        classes.forEach((cls) => {
            (cls.courses || []).forEach((course) => {
                coursesMap[course._id.toString()] = course;
            });
        });

        res.status(200).json(Object.values(coursesMap));
    } catch (err) {
        console.error('Error fetching courses for teacher:', err);
        res.status(500).json({ message: 'Error fetching courses', error: err.message });
    }
};

module.exports = {
    fetchCourses,
    editCourse,
    fetchCoursesWithChapters,
    fetchAllCoursesForTeacher,
};
