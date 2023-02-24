const {
  getUsers,
  getUserByUsername,
  postUser,
  deleteUserByUsername,
} = require('../controllers/users-controllers');

const usersRouter = require('express').Router();

usersRouter.route('/').get(getUsers).post(postUser);

usersRouter
  .route('/:username')
  .get(getUserByUsername)
  .delete(deleteUserByUsername);

module.exports = usersRouter;
