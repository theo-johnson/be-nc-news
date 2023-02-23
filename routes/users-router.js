const { getUsers } = require('../controllers/users-controllers');

const usersRouter = require('express').Router();

usersRouter.get('/users', getUsers);

module.exports = usersRouter;
