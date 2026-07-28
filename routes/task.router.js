const express = require('express');
const router = express.Router();
const taskController = require('../controller/task.controller');
const { verify } = require('../middleware/jwt'); 
const roleChecker = require('../middleware/roleChecker');
const authorizeRoles = require('../middleware/authorizeRoles');
const { MEMBER_ROLES } = require('../utils/constants');

// All task routes require authentication
router.use(verify);

// Using roleChecker without arguments acts as a simple user populator and basic auth check
router.post('/', roleChecker(MEMBER_ROLES.LEADER, MEMBER_ROLES.PRESIDENT, MEMBER_ROLES.HR_LEADER, 'HR', 'OC'), taskController.createTask);

router.get('/', roleChecker(), taskController.getTasks);
router.get('/:id', roleChecker(), taskController.getTaskById);

// Updating a task (members can update status, leaders can update everything)
router.put('/:id', roleChecker(), taskController.updateTask);

router.delete('/:id', roleChecker(MEMBER_ROLES.LEADER, MEMBER_ROLES.PRESIDENT), taskController.deleteTask);

router.post('/:id/comments', roleChecker(), taskController.addComment);

module.exports = router;
