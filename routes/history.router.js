const express = require('express');
const router = express.Router();
const historyController = require('../controller/history.controller');
const { verify } = require('../middleware/jwt'); 
const roleChecker = require('../middleware/roleChecker');
const { MEMBER_ROLES } = require('../utils/constants');

router.use(verify);

// History is read-only and restricted to high-level roles
router.get('/', roleChecker(MEMBER_ROLES.PRESIDENT, MEMBER_ROLES.HR_LEADER, 'HR', 'OC', MEMBER_ROLES.LEADER), historyController.getLogs);

module.exports = router;
