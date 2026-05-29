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
  (req, res, next) => {
    console.log('UPLOAD ROUTE HIT');
    console.log('BODY:', req.body);
    console.log('FILE:', req.file?.originalname);
    next();
  },
  uploadController.uploadImage
);

router.get('/', (req, res) => {
  res.json({
    message: 'Upload route is connected.'
  });
});

module.exports = router;