const Task = require('../models/task');

class TaskService {
  async createTask(data) {
    return await Task.create(data);
  }

  async getTasks(filter, options) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;
    
    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('assignedMembers', 'name email avatar role committee')
      .populate('createdBy', 'name email avatar role')
      .populate('completedBy', 'name email avatar');
    
    const total = await Task.countDocuments(filter);
    
    return { 
        tasks, 
        total, 
        page, 
        totalPages: Math.ceil(total / limit) 
    };
  }

  async getTaskById(taskId) {
    return await Task.findById(taskId)
      .populate('assignedMembers', 'name email avatar role committee')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('comments.member', 'name email avatar');
  }

  async updateTask(taskId, updateData) {
    return await Task.findByIdAndUpdate(taskId, updateData, { new: true, runValidators: true })
      .populate('assignedMembers', 'name email avatar role committee');
  }

  async deleteTask(taskId) {
    return await Task.findByIdAndDelete(taskId);
  }

  async addComment(taskId, memberId, text) {
    return await Task.findByIdAndUpdate(
        taskId, 
        { $push: { comments: { member: memberId, text } } },
        { new: true }
    ).populate('comments.member', 'name email avatar');
  }
}

module.exports = new TaskService();
