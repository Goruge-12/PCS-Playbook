const router = require('express').Router();
const resourceController = require('../controllers/resourceController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', resourceController.getResources);

router.get(
  '/admin',
  auth,
  adminOnly,
  resourceController.getAllResourcesAdmin
);

router.post(
  '/',
  auth,
  adminOnly,
  resourceController.createResource
);

router.put(
  '/:resourceId',
  auth,
  adminOnly,
  resourceController.updateResource
);

router.delete(
  '/:resourceId',
  auth,
  adminOnly,
  resourceController.deleteResource
);

module.exports = router;