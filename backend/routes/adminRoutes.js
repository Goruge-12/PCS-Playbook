const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/users', auth, adminOnly, adminController.getAllUsers);
router.put('/users/:id/role', auth, adminOnly, adminController.updateUserRole);
router.get('/requests', auth, adminOnly, adminController.getAllRequests);
router.put('/requests/:id/status', auth, adminOnly, adminController.updateRequestStatus);
router.put('/requests/:id/assign', auth, adminOnly, adminController.assignMentorToRequest);
router.get('/mentors', auth, adminOnly, adminController.getMentors);
router.put('/installations/:id', auth, adminOnly, adminController.updateInstallation);
router.put('/units/:id', auth, adminOnly, adminController.updateUnit);
router.get('/installations', auth, adminOnly, adminController.getInstallations);
router.get('/units', auth, adminOnly, adminController.getUnits);

module.exports = router;