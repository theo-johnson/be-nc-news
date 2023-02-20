const express = require('express');
const { getTopics } = require('./controllers/topics-controllers');
const {
  getArticles,
  getArticleById,
} = require('./controllers/articles-controllers');
const {
  handle500Errors,
  handle400Errors,
  handle404Errors,
} = require('./controllers/error-handling-controllers');

const app = express();
app.use(express.json());

app.get('/api/topics', getTopics);
app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id', getArticleById);

app.use(handle400Errors);
app.use(handle404Errors);
app.use(handle500Errors);

module.exports = app;
