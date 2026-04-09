const { getStudentProgress, updateStudentProgress } = require('../controllers/ProgressController');
const router = require('express').Router();
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/:courseId', verifyToken, authorizeRoles('admin', 'student'), getStudentProgress);
router.put('/:courseId', verifyToken, authorizeRoles('admin', 'student'), updateStudentProgress);

module.exports = router;
