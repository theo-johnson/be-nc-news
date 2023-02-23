const express = require('express');
const { getTopics } = require('./controllers/topics-controllers');
const { getUsers } = require('./controllers/users-controllers');
const { deleteCommentById } = require('./controllers/comments-controllers');
const { getEndpoints } = require('./controllers/endpoints-controllers');
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

const app = express();
app.use(express.json());

app.get('/api', getEndpoints);
app.get('/api/topics', getTopics);
app.get('/api/users', getUsers);
app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id/comments', getArticleComments);
app.post('/api/articles/:article_id/comments', postComment);

app.delete('/api/comments/:comment_id', deleteCommentById);

app.get('/api/articles/:article_id', getArticleById);
app.patch('/api/articles/:article_id', patchArticleById);

app.all('*', handleInvalidPath404Errors);

app.use(handlePSQL400Errors);
app.use(handlePSQL404Errors);
app.use(handleCustomErrors);
app.use(handle500Errors);

module.exports = app;
