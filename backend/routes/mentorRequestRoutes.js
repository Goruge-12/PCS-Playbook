const router = require('express').Router();
const mentorRequestController = require('../controllers/mentorRequestController');
const { auth } = require('../middleware/auth');

router.post('/', auth, mentorRequestController.createRequest);
router.get('/mentor-queue', auth, mentorRequestController.getMentorQueue);
router.put('/:id/reply', auth, mentorRequestController.replyToRequest);
router.get('/:id/messages', auth, mentorRequestController.getMessages);
router.post('/:id/messages', auth, mentorRequestController.createMessage);

router.get(
  '/my-requests',
  auth,
  mentorRequestController.getMyRequests
);

module.exports = router;