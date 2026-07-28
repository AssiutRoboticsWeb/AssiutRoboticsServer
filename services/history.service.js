const History = require('../models/history');

class HistoryService {
  async logAction(action, actor, target = null, targetModel = null, metadata = {}, ip = '', device = '') {
    try {
      await History.create({
        action,
        actor,
        target,
        targetModel,
        metadata,
        ip,
        device
      });
    } catch (error) {
      console.error('[History Service Error]:', error);
    }
  }

  async getLogs(filter, options) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;
    
    const logs = await History.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('actor', 'name email role committee');
      
    const total = await History.countDocuments(filter);
    
    return { logs, total, page, totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new HistoryService();
