const express = require("express");
const Router = express.Router();

const componentController = require("../controller/component.controller");
const JWT = require("../middleware/jwt");
const { uploadImage } = require("../middleware/multer");
const apiFeatures = require("../middleware/apiFeatures");
const Component = require("../models/component");
const Member = require("../models/member");
const asyncWrapper = require("../middleware/asyncWrapper");
const createError = require("../utils/createError");

// Simple Role Validation Middleware for OC
const OC_validate = asyncWrapper(async (req, res, next) => {
    const member = await Member.findOne({ email: req.decoded.email });
    if (member.committee !== "OC" && member.role !== "leader" && member.role !== "head") {
        throw createError(403, 'Fail', "This operation is only for OC members or leadership");
    }
    next();
});

// Create Component (requires image)
Router.post("/add", 
    JWT.verify, 
    OC_validate, 
    uploadImage.single("image"), 
    componentController.addComponent
);

// Get All Components (supports Pagination, Filtering, Sorting)
Router.get("/getComponents",
    apiFeatures(Component, [
        { path: 'requestToBorrow', select: 'name email committee phoneNumber avatar' },
        { path: 'borrowedBy.member', select: 'name email committee phoneNumber avatar' },
        { path: 'history.member', select: 'name email committee phoneNumber avatar' }
    ]),
    componentController.advancedResultsHandler
);

// Get Components (Deleted, Requested, Borrowed, History)
// We can use apiFeatures by passing specific queries in the request (e.g. ?deleted=true), 
// but since the frontend expects specific endpoints, we mimic them with injected queries.
Router.get("/getDeletedComponent",
    (req, res, next) => { req.query.deleted = 'true'; next(); },
    apiFeatures(Component, [
        { path: 'deletedBy', select: 'name email committee phoneNumber avatar' }
    ]),
    componentController.advancedResultsHandler
);

Router.get("/getRequestedComponent",
    (req, res, next) => { req.query['requestToBorrow[ne]'] = 'null'; next(); },
    apiFeatures(Component, [
        { path: 'requestToBorrow', select: 'name email committee phoneNumber avatar' }
    ]),
    componentController.advancedResultsHandler
);

Router.get("/getBorrowedComponent",
    (req, res, next) => { req.query['borrowedBy[ne]'] = 'null'; next(); },
    apiFeatures(Component, [
        { path: 'borrowedBy.member', select: 'name email committee phoneNumber avatar' }
    ]),
    componentController.advancedResultsHandler
);

Router.get("/getHistoryComponent",
    (req, res, next) => { req.query['history[ne]'] = '[]'; next(); },
    apiFeatures(Component, [
        { path: 'history.member', select: 'name email committee phoneNumber avatar' },
        { path: 'history.acceptedBy', select: 'name email committee phoneNumber avatar' },
        { path: 'history.returnBy', select: 'name email committee phoneNumber avatar' }
    ]),
    componentController.advancedResultsHandler
);

// Actions
Router.post("/update", JWT.verify, OC_validate, componentController.updateComponent);
Router.post("/deleteOne", JWT.verify, OC_validate, componentController.deleteOne);
Router.post("/return", JWT.verify, OC_validate, componentController.returnComponent);

// Borrow Requests
Router.post("/requestToBorrow", JWT.verify, componentController.requestToBorrow);
Router.post("/acceptRequestToBorrow", JWT.verify, OC_validate, componentController.acceptRequestToBorrow);
Router.post("/rejectRequestToBorrow", JWT.verify, OC_validate, componentController.rejectRequestToBorrow);

module.exports = Router;