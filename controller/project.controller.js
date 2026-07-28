const projectService = require('../services/project.service');
const asyncWrapper = require('../middleware/asyncWrapper');
const createError = require('../utils/createError');

const createProject = asyncWrapper(async (req, res, next) => {
  const project = await projectService.createProject(req.body, req.user._id);
  res.status(201).json({ success: true, data: project });
});

const getProjects = asyncWrapper(async (req, res, next) => {
  const { page, limit, status, committee, leader } = req.query;
  const filter = {};
  
  if (status) filter.status = status;
  if (committee) filter.committee = committee;
  if (leader) filter.leader = leader;

  const result = await projectService.getProjects(filter, { 
    page: parseInt(page) || 1, 
    limit: parseInt(limit) || 10 
  });
  res.status(200).json({ success: true, data: result });
});

const getProjectById = asyncWrapper(async (req, res, next) => {
  const project = await projectService.getProjectById(req.params.id);
  if (!project) return next(createError(404, 'FAIL', 'Project not found'));
  res.status(200).json({ success: true, data: project });
});

const updateProject = asyncWrapper(async (req, res, next) => {
  const project = await projectService.updateProject(req.params.id, req.body, req.user._id);
  if (!project) return next(createError(404, 'FAIL', 'Project not found'));
  res.status(200).json({ success: true, data: project });
});

const deleteProject = asyncWrapper(async (req, res, next) => {
  const project = await projectService.deleteProject(req.params.id, req.user._id);
  if (!project) return next(createError(404, 'FAIL', 'Project not found'));
  res.status(200).json({ success: true, message: 'Project deleted successfully' });
});

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };
