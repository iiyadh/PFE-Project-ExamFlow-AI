const {
        getMarkdownContent,
    editMarkdownContent,
    addMarkdownContent,
    deleteMarkdownContent
} = require('../controllers/markdownController');
const express = require('express');
const router = express.Router();
const { verifyToken , authorizeRoles } = require('../middlewares/authMiddleware');


router.get('/:coursId', verifyToken, authorizeRoles('admin' , 'student', 'teacher'), getMarkdownContent);
router.put('/:markdownId', verifyToken, authorizeRoles('admin' , 'teacher'), editMarkdownContent);
router.post('/:coursId', verifyToken, authorizeRoles('admin' , 'teacher'), addMarkdownContent);
router.delete('/:markdownId', verifyToken, authorizeRoles('admin' , 'teacher'), deleteMarkdownContent);


module.exports = router;