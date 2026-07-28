const Project = require('../models/project');
const historyService = require('./history.service');

class ProjectService {
  async createProject(data, actorId) {
    const project = await Project.create(data);
    await historyService.logAction('PROJECT_CREATED', actorId, project._id, 'Project', { title: project.title });
    return project;
  }

  async getProjects(filter, options) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;
    
    const projects = await Project.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('componentsUsed', 'name status');
      
    const total = await Project.countDocuments(filter);
    
    return { projects, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getProjectById(projectId) {
    return await Project.findById(projectId)
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('componentsUsed', 'name status category');
  }

  async updateProject(projectId, updateData, actorId) {
    const project = await Project.findByIdAndUpdate(projectId, updateData, { new: true, runValidators: true });
    if (project) {
        await historyService.logAction('PROJECT_UPDATED', actorId, project._id, 'Project', { updateKeys: Object.keys(updateData) });
    }
    return project;
  }

  async deleteProject(projectId, actorId) {
    const project = await Project.findById(projectId);
    if (project) {
        await historyService.logAction('PROJECT_DELETED', actorId, null, 'Project', { title: project.title });
        await project.deleteOne();
    }
    return project;
  }
}

module.exports = new ProjectService();
