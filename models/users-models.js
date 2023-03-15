const db = require('../db/connection');

exports.fetchUsers = () => {
  const usersQueryString = `
    SELECT * FROM users`;
  return db.query(usersQueryString).then(({ rows }) => {
    return rows;
  });
};

exports.fetchUserByUsername = (username) => {
  const usersQueryString = `
    SELECT * FROM users WHERE username = $1`;
  return db.query(usersQueryString, [username]).then(({ rows }) => {
    if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });
    return rows[0];
  });
};

exports.insertUser = (username, name, avatar_url) => {
  const userQueryString = `
INSERT INTO users (username, name, avatar_url)
VALUES ($1, $2, $3)
RETURNING *;`;
  return db
    .query(userQueryString, [username, name, avatar_url])
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.deleteUserFromDb = (username) => {
  const deleteUserQueryString = `
DELETE FROM users
WHERE username = $1
RETURNING *;`;
  return db.query(deleteUserQueryString, [username]).then(({ rows }) => {
    if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });
    return;
  });
};

exports.updateUserVotes = (username, article_id, comment_id, vote_value) => {
  const tableToUpdate = article_id
    ? 'users_article_votes'
    : 'users_comment_votes';
  const columnToUpdate = article_id ? 'article_id' : 'comment_id';
  const idToUpdate = article_id ? article_id : comment_id;

  return db
    .query(
      `
SELECT * FROM ${tableToUpdate}
WHERE username = $1 AND ${columnToUpdate} = ${idToUpdate}`,
      [username]
    )
    .then(({ rows }) => {
      const voteAlreadyApplied = !rows.length
        ? false
        : rows[0].vote_value === vote_value;

      const deleteQueryString = `
DELETE FROM ${tableToUpdate}
WHERE username = $1 AND ${columnToUpdate} = ${idToUpdate}
RETURNING *;`;
      const insertQueryString = `
INSERT INTO ${tableToUpdate} (username, ${columnToUpdate}, vote_value)
VALUES ($1, $2, $3)
RETURNING *;`;

      const queryPromises = [db.query(deleteQueryString, [username])];
      if (!voteAlreadyApplied)
        queryPromises.push(
          db.query(insertQueryString, [username, idToUpdate, vote_value])
        );

      return Promise.all(queryPromises).then((promiseResults) => {
        const responseObj =
          promiseResults.length === 1
            ? {
                username,
                [columnToUpdate]: idToUpdate,
                vote_value: 0,
              }
            : promiseResults[1].rows[0];
        return responseObj;
      });
    });
};
