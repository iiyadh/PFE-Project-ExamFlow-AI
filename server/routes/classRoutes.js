const {
    createClass,
    getClassesByTeacher,
    updateClass,
    deleteClass,
    getClassesByStudent
} = require('../controllers/classController');
const { verifyToken , authorizeRoles } = require('../middlewares/authMiddleware');
const router = require('express').Router();


router.post('/' , verifyToken , authorizeRoles('admin' , "teacher"), createClass);
router.get('/teacher' , verifyToken ,authorizeRoles('admin' , "teacher"), getClassesByTeacher);
router.get('/student' , verifyToken ,authorizeRoles('admin' , "student"), getClassesByStudent);
router.put('/:classId' , verifyToken ,authorizeRoles('admin' , "teacher"), updateClass);
router.delete('/:classId' , verifyToken , authorizeRoles('admin' , "teacher"), deleteClass);


module.exports = router;