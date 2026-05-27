const router = require('express').Router();
const unitController = require('../controllers/unitController');

router.get('/search', unitController.searchUnits);

router.get(
  '/installation/:installationId',
  unitController.getUnitsByInstallation
);

// NEW
router.get(
  '/:unitId',
  unitController.getUnitById
);

module.exports = router;