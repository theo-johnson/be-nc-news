const db = require('../db/connection');

exports.deleteCommentFromDb = (comment_id) => {
  const deleteCommentQueryString = `
DELETE FROM comments
WHERE comment_id = $1
RETURNING *;`;
  return db.query(deleteCommentQueryString, [comment_id]).then(({ rows }) => {
    if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });
    return;
  });
};

exports.updateCommentById = (comment_id, inc_votes) => {
  const updateCommentQueryString = `
UPDATE comments SET votes = votes + $1
WHERE comment_id = $2
RETURNING *;`;
  return db
    .query(updateCommentQueryString, [inc_votes, comment_id])
    .then(({ rows }) => {
      if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });
      return rows[0];
    });
};
