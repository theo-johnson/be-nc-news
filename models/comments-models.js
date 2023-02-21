const db = require('../db/connection');

exports.deleteCommentFromDb = (comment_id) => {
  const topicsQueryString = `
DELETE FROM comments
WHERE comment_id = $1
RETURNING *;`;
  return db.query(topicsQueryString, [comment_id]).then(({ rows }) => {
    if (!rows[0]) return Promise.reject('Comment not found');
    return;
  });
};
