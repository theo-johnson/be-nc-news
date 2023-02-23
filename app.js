const express = require('express');
const { getTopics } = require('./controllers/topics-controllers');
const { getUsers } = require('./controllers/users-controllers');
const {
  getArticles,
  getArticleComments,
  getArticleById,
  patchArticleById,
  postComment,
} = require('./controllers/articles-controllers');
const {
  handlePSQL400Errors,
  handlePSQL404Errors,
  handleCustomErrors,
  handleInvalidPath404Errors,
  handle500Errors,
} = require('./controllers/error-handling-controllers');

const apiRouter = require('./routes/api-router');
const articlesRouter = require('./routes/articles-router');
const usersRouter = require('./routes/users-router');
const topicsRouter = require('./routes/topics-router');

const app = express();
app.use(express.json());

// app.get('/api/topics', getTopics);

// app.get('/api/users', getUsers);

// app.get('/api/articles', getArticles);

// app.get('/api/articles/:article_id/comments', getArticleComments);
// app.post('/api/articles/:article_id/comments', postComment);

// app.get('/api/articles/:article_id', getArticleById);
// app.patch('/api/articles/:article_id', patchArticleById);

app.use('/api', apiRouter);
app.use('/articles', articlesRouter);
app.use('/users', usersRouter);
app.use('/topics', topicsRouter);
app.all('*', handleInvalidPath404Errors);

app.use(handlePSQL400Errors);
app.use(handlePSQL404Errors);
app.use(handleCustomErrors);
app.use(handle500Errors);

module.exports = app;
