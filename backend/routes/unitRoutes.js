const router = require('express').Router();
const unitController = require('../controllers/unitController');

router.get(
  '/search',
  unitController.searchUnits
);

router.get(
  '/installation/:installationId',
  unitController.getUnitsByInstallation
);

// ADMIN - Create Unit
router.post(
  '/',
  unitController.createUnit
);

// ADMIN - Delete Unit
router.delete(
  '/:unitId',
  unitController.deleteUnit
);

// Get Single Unit
router.get(
  '/:unitId',
  unitController.getUnitById
);

module.exports = router;