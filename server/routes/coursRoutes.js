const { fetchCourses,
    editCourse } = require('../controllers/coursController');
const express = require('express');
const router = express.Router();
const { verifyToken , authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/:cid', verifyToken, authorizeRoles('admin' , 'student', 'teacher'), fetchCourses);
router.put('/:courseId', verifyToken, authorizeRoles('admin' , 'teacher'), editCourse);

module.exports = router;
