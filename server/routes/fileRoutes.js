const { verifyToken , authorizeRoles } = require('../middlewares/authMiddleware');
const router = require('express').Router();
const {
        uploadFile,
        getFilesByClass,
        deleteFile
} = require('../controllers/FileController');

router.post('/:classId' , verifyToken , authorizeRoles('admin' , "teacher"), uploadFile);
router.get('/:classId' , verifyToken , authorizeRoles('admin' , "teacher" , "student"), getFilesByClass);
router.delete('/:fileId' , verifyToken , authorizeRoles('admin' , "teacher"), deleteFile);


module.exports = router;