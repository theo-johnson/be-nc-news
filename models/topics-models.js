const db = require('../db/connection');

exports.fetchTopics = () => {
  const topicsQueryString = `
    SELECT * FROM topics`;
  return db.query(topicsQueryString).then(({ rows }) => {
    return rows;
  });
};
