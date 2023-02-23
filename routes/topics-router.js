const { getTopics } = require('../controllers/topics-controllers');

const topicsRouter = require('express').Router();

topicsRouter.get('/topics', getTopics);

module.exports = topicsRouter;
