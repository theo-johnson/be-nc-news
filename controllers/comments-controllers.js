const { deleteCommentFromDb } = require('../models/comments-models');
const { updateCommentById } = require('../models/comments-models');

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  deleteCommentFromDb(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  updateCommentById(comment_id, inc_votes)
    .then((updatedComment) => {
      res.status(200).send({ updatedComment });
    })
    .catch((err) => {
      next(err);
    });
};
