const router = require('express').Router();
const installationController = require('../controllers/installationController');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', installationController.getInstallations);
router.get('/:id', installationController.getInstallationById);
router.post('/', auth, adminOnly, upload.single('image'), installationController.createInstallation);
router.put('/:id', auth, adminOnly, upload.single('image'), installationController.updateInstallation);
router.delete('/:id', auth, adminOnly, installationController.deleteInstallation);

module.exports = router;
