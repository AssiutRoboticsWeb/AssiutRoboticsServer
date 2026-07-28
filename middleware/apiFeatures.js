const apiFeatures = (model, populates = []) => {
    return async (req, res, next) => {
        let query;
        const reqQuery = { ...req.query };

        // Fields to exclude from direct filtering
        const removeFields = ['select', 'sort', 'page', 'limit', 'keyword'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Parse modified query string
        const parsedQuery = JSON.parse(queryStr);

        // Add search keyword if exists
        if (req.query.keyword) {
            parsedQuery.$or = [
                { title: { $regex: req.query.keyword, $options: 'i' } },
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { description: { $regex: req.query.keyword, $options: 'i' } }
            ];
        }

        // Finding resource
        query = model.find(parsedQuery);

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        // Populate
        if (populates && populates.length > 0) {
            populates.forEach(pop => {
                query = query.populate(pop);
            });
        }

        // Executing query
        const results = await query;
        const total = await model.countDocuments(parsedQuery);

        res.advancedResults = {
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: results
        };

        next();
    };
};

module.exports = apiFeatures;
