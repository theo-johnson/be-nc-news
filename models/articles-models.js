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

exports.fetchArticleComments = (article_id) => {
  if (typeof article_id !== 'number' || isNaN(article_id))
    return Promise.reject('Invalid article ID');
  return db
    .query('SELECT * FROM articles WHERE article_id = $1', [article_id])
    .then(({ rows }) => {
      if (!rows[0]) return Promise.reject('Article not found');
      const articleCommentsQueryString = `SELECT * FROM comments WHERE article_id = $1`;
      return db.query(articleCommentsQueryString, [article_id]);
    })
    .then(({ rows }) => {
      if (!rows[0]) return Promise.reject('Article has no comments');
      return rows;
    });
};
