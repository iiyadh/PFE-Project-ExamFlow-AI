const { verifyToken , authorizeRoles  } = require('../middlewares/authMiddleware');
const { getUserProfile , fetchUsers ,toggleBlockUser , deleteUser} = require('../controllers/userController');
const router = require('express').Router();

router.get('/profile', verifyToken, authorizeRoles('admin' , "user") , getUserProfile);
router.get('/all', verifyToken, authorizeRoles('admin') , fetchUsers);
router.put('/toggle-block/:id', verifyToken, authorizeRoles('admin'), toggleBlockUser);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteUser);


module.exports = router;