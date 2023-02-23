const db = require('../db/connection');

exports.fetchTopics = () => {
  const topicsQueryString = `
SELECT * FROM topics`;
  return db.query(topicsQueryString).then(({ rows }) => {
    return rows;
  });
};

exports.insertTopic = (slug, description) => {
  const topicQueryString = `
INSERT INTO topics (slug, description)
VALUES ($1, $2)
RETURNING *;`;
  return db.query(topicQueryString, [slug, description]).then(({ rows }) => {
    return rows[0];
  });
};
