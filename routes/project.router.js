const express = require('express');
const router = express.Router();
const projectController = require('../controller/project.controller');
const { verify } = require('../middleware/jwt'); 
const roleChecker = require('../middleware/roleChecker');
const { MEMBER_ROLES } = require('../utils/constants');

// Projects can be viewed by anyone
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);

router.use(verify);

router.post('/', roleChecker(MEMBER_ROLES.LEADER, MEMBER_ROLES.PRESIDENT, 'OC'), projectController.createProject);
router.put('/:id', roleChecker(MEMBER_ROLES.LEADER, MEMBER_ROLES.PRESIDENT, 'OC'), projectController.updateProject);
router.delete('/:id', roleChecker(MEMBER_ROLES.PRESIDENT), projectController.deleteProject);

module.exports = router;
