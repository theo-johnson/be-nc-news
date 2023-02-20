const db = require('../db/connection');

exports.fetchArticles = () => {
  const articlesQueryString = `
SELECT articles.*, COUNT(comments.comment_id) AS comment_count
FROM articles
FULL OUTER JOIN comments ON comments.article_id = articles.article_id
GROUP BY articles.article_id
ORDER BY articles.created_at DESC;`;
  return db.query(articlesQueryString).then(({ rows }) => {
    rows.forEach((row) => (row.comment_count = +row.comment_count));
    return rows;
  });
};
