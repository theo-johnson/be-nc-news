const express = require('express');
const { getTopics } = require('./controllers/topics-controllers');
const { getArticles } = require('./controllers/articles-controllers');
const { handle500Errors } = require('./controllers/error-handling-controllers');

const app = express();
app.use(express.json());

app.get('/api/topics', getTopics);
app.get('/api/articles', getArticles);

app.use(handle500Errors);

module.exports = app;
