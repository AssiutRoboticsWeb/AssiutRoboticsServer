const searchService = require('../services/search.service');
const asyncWrapper = require('../middleware/asyncWrapper');
const ApiResponse = require('../utils/apiResponse');

const search = asyncWrapper(async (req, res) => {
    const { q } = req.query;
    const results = await searchService.globalSearch(q);
    res.status(200).json(new ApiResponse(200, results, "Search completed successfully"));
});

module.exports = {
    search
};
