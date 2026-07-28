const express = require('express');
const router = express.Router();
const eventController = require('../controller/event.controller');
const { verify } = require('../middleware/jwt'); 
const roleChecker = require('../middleware/roleChecker');
const { MEMBER_ROLES } = require('../utils/constants');

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/:id/register', eventController.registerGuest);

// Protected routes
router.use(verify);
router.post('/', roleChecker(MEMBER_ROLES.LEADER, MEMBER_ROLES.PRESIDENT, 'PR'), eventController.createEvent);
router.post('/:id/attendance', roleChecker(), eventController.markAttendance);

module.exports = router;
