const express = require('express');
const router = express.Router();
const taskController = require('../controller/task.controller');
const jwt = require('../middleware/jwt');

// POST /tasks/assign - Assign task to member
router.post('/assign', jwt.verify, taskController.assignTask);

// POST /tasks/submit - Submit task
router.post('/submit', jwt.verify, taskController.submitTask);

// PUT /tasks/rate - Rate task
router.put('/rate', jwt.verify, taskController.rateTask);

// GET /tasks/completed - Get completed tasks
router.get('/completed', jwt.verify, taskController.getCompletedTasks);

// GET /tasks/my-tasks - Get member's own tasks
router.get('/my-tasks', jwt.verify, taskController.getMyTasks);

module.exports = router;
