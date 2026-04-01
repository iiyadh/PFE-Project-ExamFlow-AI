const { verifyToken , authorizeRoles } = require('../middlewares/authMiddleware');
const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
        uploadFile,
        getFilesByClass,
        deleteFile,
        convertFileToCourse,
} = require('../controllers/FileController');

router.post('/:classId' , verifyToken , authorizeRoles('admin' , "teacher"), upload.single('file'), uploadFile);
router.get('/:classId' , verifyToken , authorizeRoles('admin' , "teacher" , "student"), getFilesByClass);
router.delete('/:fileId' , verifyToken , authorizeRoles('admin' , "teacher"), deleteFile);
router.post('/convert/:fileId' , verifyToken , authorizeRoles('admin' , "teacher"), convertFileToCourse);

module.exports = router;