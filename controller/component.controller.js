const componentService = require('../services/component.service');
const asyncWrapper = require('../middleware/asyncWrapper');
const httpStatusText = require('../utils/httpStatusText');
const ApiResponse = require('../utils/apiResponse');

const addComponent = asyncWrapper(async (req, res) => {
    const component = await componentService.createComponent(req.body, req.file, req.decoded.email);
    res.status(201).json(new ApiResponse(201, component, "Component added successfully"));
});

const updateComponent = asyncWrapper(async (req, res) => {
    // req.body should contain id and newpro (based on old implementation)
    const { id, newpro } = req.body;
    const component = await componentService.updateComponent(id, newpro, req.decoded.email);
    res.status(200).json(new ApiResponse(200, component, "Component updated successfully"));
});

const deleteOne = asyncWrapper(async (req, res) => {
    const { id } = req.body;
    await componentService.deleteComponent(id, req.decoded.email);
    res.status(200).json(new ApiResponse(200, null, "Component deleted successfully"));
});

const requestToBorrow = asyncWrapper(async (req, res) => {
    const { componentId } = req.body;
    const component = await componentService.requestBorrow(componentId, req.decoded.email);
    res.status(200).json(new ApiResponse(200, component, "Borrow request submitted successfully"));
});

const acceptRequestToBorrow = asyncWrapper(async (req, res) => {
    const { componentId, borrowDate, deadlineDate } = req.body;
    const component = await componentService.processBorrowRequest(componentId, req.decoded.email, 'accept', borrowDate, deadlineDate);
    res.status(200).json(new ApiResponse(200, component, "Borrow request accepted"));
});

const rejectRequestToBorrow = asyncWrapper(async (req, res) => {
    const { componentId } = req.body;
    const component = await componentService.processBorrowRequest(componentId, req.decoded.email, 'reject');
    res.status(200).json(new ApiResponse(200, component, "Borrow request rejected"));
});

const returnComponent = asyncWrapper(async (req, res) => {
    const { componentId } = req.body;
    const component = await componentService.returnComponent(componentId, req.decoded.email);
    res.status(200).json(new ApiResponse(200, component, "Component returned successfully"));
});

const advancedResultsHandler = (req, res) => {
    res.status(200).json(res.advancedResults);
};

module.exports = {
    addComponent,
    updateComponent,
    deleteOne,
    requestToBorrow,
    acceptRequestToBorrow,
    rejectRequestToBorrow,
    returnComponent,
    advancedResultsHandler
};