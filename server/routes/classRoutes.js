const {
    createClass,
    getClassesByTeacher,
    updateClass,
    deleteClass,
    getClassesByStudent,
    searchStudents,
    fetchJoinRequests,
    sendJoinRequest,
    denyJoinRequest
} = require('../controllers/classController');
const { verifyToken , authorizeRoles } = require('../middlewares/authMiddleware');
const router = require('express').Router();


router.post('/' , verifyToken , authorizeRoles('admin' , "teacher"), createClass);
router.get('/teacher' , verifyToken ,authorizeRoles('admin' , "teacher"), getClassesByTeacher);
router.get('/student' , verifyToken ,authorizeRoles('admin' , "student"), getClassesByStudent);
router.put('/:classId' , verifyToken ,authorizeRoles('admin' , "teacher"), updateClass);
router.delete('/:classId' , verifyToken , authorizeRoles('admin' , "teacher"), deleteClass);
router.get('/search/students' , verifyToken , authorizeRoles('admin' , "teacher"), searchStudents);
router.get('/joinrequests/:classId' , verifyToken , authorizeRoles('admin' , "teacher"), fetchJoinRequests);
router.post('/joinrequests' , verifyToken , authorizeRoles('admin' , "teacher"), sendJoinRequest);
router.post('/joinrequests/deny' , verifyToken , authorizeRoles('admin' , "teacher"), denyJoinRequest);


module.exports = router;