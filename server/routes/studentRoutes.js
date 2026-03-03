const {
    AcceptRejectRequest , fetchStudentRequests ,fetchStudentsClass , kickStudent ,leaveClass
} = require('../controllers/studentController');
const router = require('express').Router();
const { verifyToken , authorizeRoles  } = require('../middlewares/authMiddleware');


router.post('/request', verifyToken, authorizeRoles('admin', 'student'), AcceptRejectRequest);
router.get('/requests', verifyToken, authorizeRoles('admin', 'student'), fetchStudentRequests);
router.get('/students/:classId', verifyToken, authorizeRoles('admin', 'teacher'), fetchStudentsClass);
router.post('/kick', verifyToken, authorizeRoles('admin', 'teacher'), kickStudent);
router.post('/leave', verifyToken, authorizeRoles('admin', 'student'), leaveClass);

module.exports = router;