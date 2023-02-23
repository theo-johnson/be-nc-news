const express = require('express');
const {
  handlePSQL400Errors,
  handlePSQL404Errors,
  handleCustomErrors,
  handleInvalidPath404Errors,
  handle500Errors,
} = require('./controllers/error-handling-controllers');

const apiRouter = require('./routes/api-router');

const app = express();
app.use(express.json());

app.use('/api', apiRouter);
app.all('*', handleInvalidPath404Errors);

app.use(handlePSQL400Errors);
app.use(handlePSQL404Errors);
app.use(handleCustomErrors);
app.use(handle500Errors);

module.exports = app;
