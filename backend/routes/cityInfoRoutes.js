const router = require('express').Router();
const cityInfoController = require('../controllers/cityInfoController');
const { auth, adminOnly } = require('../middleware/auth');

router.get(
  '/installation/:installationId',
  cityInfoController.getCityInfo
);

router.put(
  '/installation/:installationId',
  auth,
  adminOnly,
  cityInfoController.saveCityInfo
);

router.post(
  '/installation/:installationId/attractions',
  auth,
  adminOnly,
  cityInfoController.addAttraction
);

router.delete(
  '/attractions/:attractionId',
  auth,
  adminOnly,
  cityInfoController.deleteAttraction
);

router.put(
  '/attractions/:attractionId',
  auth,
  adminOnly,
  cityInfoController.updateAttraction
);
module.exports = router;