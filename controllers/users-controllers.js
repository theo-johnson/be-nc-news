const {
  fetchUsers,
  fetchUserByUsername,
  insertUser,
  deleteUserFromDb,
} = require('../models/users-models');

exports.getUsers = (req, res, next) => {
  fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  fetchUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postUser = (req, res, next) => {
  const { username, name, avatar_url } = req.body;
  insertUser(username, name, avatar_url)
    .then((postedUser) => {
      res.status(201).send({ postedUser });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteUserByUsername = (req, res, next) => {
  const { username } = req.params;
  deleteUserFromDb(username)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};
