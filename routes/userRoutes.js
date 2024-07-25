const {Router}= require('express');
const {registerUser,loginUser} = require('../controllers/userControllers')
// const authMiddleware = require('../middleware/authMiddleware')
const router = Router();

router.post('/register',registerUser);
router.post('/login',loginUser);

module.exports = router
