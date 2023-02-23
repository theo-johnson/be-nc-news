const { updateCommentById } = require('../models/comments-models');

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
