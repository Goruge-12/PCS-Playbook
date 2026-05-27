const router = require('express').Router();
const mentorController = require('../controllers/mentorController');

router.get('/', mentorController.getMentors);

module.exports = router;