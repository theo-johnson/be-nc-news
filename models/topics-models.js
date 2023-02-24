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

exports.deleteTopicFromDb = (slug) => {
  const deleteTopicQueryString = `
DELETE FROM topics
WHERE slug = $1
RETURNING *;`;
  return db.query(deleteTopicQueryString, [slug]).then(({ rows }) => {
    if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });
    return;
  });
};
