const {
    login,
    register,
    logout,
    checkAuth,
    signWithGoogle } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = require('express').Router();


router.post('/login' , login);
router.post('/register' , register);
router.post('/google/:token' , signWithGoogle);
router.post('/logout' , logout);
router.get('/checkAuth' , verifyToken , checkAuth);





module.exports = router;