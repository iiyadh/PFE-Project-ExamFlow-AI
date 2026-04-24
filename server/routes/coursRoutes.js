const { fetchCourses,
    editCourse,
    fetchCoursesWithChapters,
    fetchAllCoursesForTeacher } = require('../controllers/coursController');
const express = require('express');
const router = express.Router();
const { verifyToken , authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/for-teacher', verifyToken, authorizeRoles('admin', 'teacher'), fetchAllCoursesForTeacher);
router.get('/:cid', verifyToken, authorizeRoles('admin' , 'student', 'teacher'), fetchCourses);
router.get('/:cid/with-chapters', verifyToken, authorizeRoles('admin', 'teacher'), fetchCoursesWithChapters);
router.put('/:courseId', verifyToken, authorizeRoles('admin' , 'teacher'), editCourse);

module.exports = router;
