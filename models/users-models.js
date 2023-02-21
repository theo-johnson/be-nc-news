const db = require('../db/connection');

exports.fetchUsers = () => {
  const usersQueryString = `
    SELECT * FROM users`;
  return db.query(usersQueryString).then(({ rows }) => {
    console.log(rows);
    return rows;
  });
};
