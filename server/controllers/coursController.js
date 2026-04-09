const Course = require('../models/Course');
const MarkdownContent = require('../models/MarkdownContent');


const fetchCourses = async (req,res) =>{
    try{
        const {cid} = req.params;
        const courses = await Course.find();
        res.status(200).json(courses);
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


module.exports = {
    fetchCourses,
    editCourse,
};
