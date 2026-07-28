const express = require('express');
const Router = express.Router();
const searchController = require('../controller/search.controller');
const JWT = require('../middleware/jwt');

// Ensure only authenticated users can use the global search
Router.get('/', JWT.verify, searchController.search);

module.exports = Router;
