const {
  getTopics,
  postTopic,
  deleteTopicBySlug,
} = require('../controllers/topics-controllers');

const topicsRouter = require('express').Router();

topicsRouter.route('/').get(getTopics).post(postTopic);

topicsRouter.delete('/:slug', deleteTopicBySlug);

module.exports = topicsRouter;
