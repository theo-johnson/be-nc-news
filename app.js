const express = require('express');
const { getTopics } = require('./controllers/topics-controllers');
const {
  getArticles,
  getArticleComments,
  getArticleById,
  postComment,
} = require('./controllers/articles-controllers');
const {
  handlePSQL400Errors,
  handleCustom500Errors,
  handleCustom400Errors,
  handleCustom404Errors,
} = require('./controllers/error-handling-controllers');

const app = express();
app.use(express.json());

app.get('/api/topics', getTopics);
app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id/comments', getArticleComments);
app.post('/api/articles/:article_id/comments', postComment);
app.get('/api/articles/:article_id', getArticleById);

app.use(handlePSQL400Errors);
app.use(handleCustom400Errors);
app.use(handleCustom404Errors);
app.use(handleCustom500Errors);

module.exports = app;
