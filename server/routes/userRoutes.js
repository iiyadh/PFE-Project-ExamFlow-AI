const { verifyToken , authorizeRoles  } = require('../middlewares/authMiddleware');
const { getUserProfile , fetchUsers ,toggleBlockUser , deleteUser ,linkWithGoogle ,sendOTPCode,
    verifyOTPCode , changePassword , editProfile , setRoleUser} = require('../controllers/userController');
const router = require('express').Router();

router.get('/profile', verifyToken, authorizeRoles('admin' , "user") , getUserProfile);
router.post('/linkgoogle/:token', verifyToken, authorizeRoles('admin',"user") , linkWithGoogle);
router.post('/send-otp', verifyToken, authorizeRoles('admin',"user") , sendOTPCode);
router.post('/verify-otp', verifyToken, authorizeRoles('admin',"user") , verifyOTPCode);
router.get('/all', verifyToken, authorizeRoles('admin') , fetchUsers);
router.put('/toggle-block/:id', verifyToken, authorizeRoles('admin'), toggleBlockUser);
router.put('/change-password', verifyToken, authorizeRoles('admin', 'user'), changePassword);
router.put('/edit-profile', verifyToken, authorizeRoles('admin', 'user'), editProfile);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteUser);
router.put('/setrole', verifyToken, authorizeRoles('user'), setRoleUser);

module.exports = router;