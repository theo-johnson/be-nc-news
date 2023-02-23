const app = require('../app');
const articlesRouter = require('./articles-router');
const topicsRouter = require('./topics-router');
const usersRouter = require('./users-router');

const apiRouter = require('express').Router();

apiRouter.get('/api'); // ADD /api endpoints info controller

apiRouter.use('/users', usersRouter);
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);

module.exports = apiRouter;
