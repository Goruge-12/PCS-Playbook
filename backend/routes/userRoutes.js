const router = require('express').Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', auth, userController.getProfile);
router.put('/profile/image', auth, upload.single('image'), userController.updateProfileImage);

module.exports = router;
