const historyService = require('../services/history.service');
const asyncWrapper = require('../middleware/asyncWrapper');

const getLogs = asyncWrapper(async (req, res, next) => {
  const { page, limit, action, actor } = req.query;
  const filter = {};
  
  if (action) filter.action = action;
  if (actor) filter.actor = actor;

  const result = await historyService.getLogs(filter, { 
    page: parseInt(page) || 1, 
    limit: parseInt(limit) || 20 
  });
  
  res.status(200).json({ success: true, data: result });
});

module.exports = { getLogs };
