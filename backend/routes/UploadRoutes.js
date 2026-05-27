
const router = require('express').Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { auth, adminOnly } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  '/',
  auth,
  adminOnly,
  upload.single('image'),
  uploadController.uploadImage
);

router.get('/', (req, res) => {
  res.json({ message: 'Upload route is connected.' });
});
module.exports = router;