const db = require('../db/connection');

exports.fetchUsers = () => {
  const usersQueryString = `
    SELECT * FROM users`;
  return db.query(usersQueryString).then(({ rows }) => {
    return rows;
  });
};

exports.fetchUserById = (username) => {
  const usersQueryString = `
    SELECT * FROM users WHERE username = $1`;
  return db.query(usersQueryString, [username]).then(({ rows }) => {
    if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });
    return rows[0];
  });
};
