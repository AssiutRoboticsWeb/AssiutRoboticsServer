const taskService = require('../services/task.service');
const asyncWrapper = require('../middleware/asyncWrapper');
const createError = require('../utils/createError');

const createTask = asyncWrapper(async (req, res, next) => {
  req.body.createdBy = req.user._id; // from roleChecker middleware
  const task = await taskService.createTask(req.body);
  res.status(201).json({ success: true, data: task });
});

const getTasks = asyncWrapper(async (req, res, next) => {
  const { page, limit, status, priority, committee, memberId, overdue } = req.query;
  const filter = {};
  
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (committee) filter.committee = committee;
  if (memberId) filter.assignedMembers = memberId;
  
  if (overdue === 'true') {
      filter.deadline = { $lt: new Date() };
      filter.status = { $nin: ['COMPLETED', 'SUBMITTED'] };
  }

  const result = await taskService.getTasks(filter, { 
    page: parseInt(page) || 1, 
    limit: parseInt(limit) || 10 
  });
  res.status(200).json({ success: true, data: result });
});

const getTaskById = asyncWrapper(async (req, res, next) => {
  const task = await taskService.getTaskById(req.params.id);
  if (!task) return next(createError(404, 'FAIL', 'Task not found'));
  res.status(200).json({ success: true, data: task });
});

const updateTask = asyncWrapper(async (req, res, next) => {
  if (req.body.status === 'COMPLETED' || req.body.status === 'SUBMITTED') {
    if (!req.body.completedBy) req.body.completedBy = req.user._id;
    if (!req.body.submissionDate) req.body.submissionDate = new Date();
  }
  
  const task = await taskService.updateTask(req.params.id, req.body);
  if (!task) return next(createError(404, 'FAIL', 'Task not found'));
  res.status(200).json({ success: true, data: task });
});

const deleteTask = asyncWrapper(async (req, res, next) => {
  const task = await taskService.deleteTask(req.params.id);
  if (!task) return next(createError(404, 'FAIL', 'Task not found'));
  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

const addComment = asyncWrapper(async (req, res, next) => {
    const { text } = req.body;
    if (!text) return next(createError(400, 'FAIL', 'Comment text is required'));
    
    const task = await taskService.addComment(req.params.id, req.user._id, text);
    if (!task) return next(createError(404, 'FAIL', 'Task not found'));
    res.status(201).json({ success: true, data: task });
});

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask, addComment };
