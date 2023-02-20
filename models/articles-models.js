const db = require('../db/connection');

exports.fetchArticles = () => {
  const articlesQueryString = `
SELECT articles.article_id, articles.author, articles.topic, articles.title, 
articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count
FROM articles
FULL OUTER JOIN comments ON comments.article_id = articles.article_id
GROUP BY articles.article_id
ORDER BY articles.created_at DESC;`;
  return db.query(articlesQueryString).then(({ rows }) => {
    rows.forEach((row) => (row.comment_count = +row.comment_count));
    return rows;
  });
};

exports.fetchArticleById = (article_id) => {
  const articleQueryString = `
SELECT article_id, author, topic, title, body,
created_at, votes, article_img_url
FROM articles
WHERE article_id = $1;`;
  if (typeof article_id !== 'number' || isNaN(article_id))
    return Promise.reject('Invalid article ID');
  else
    return db.query(articleQueryString, [article_id]).then(({ rows }) => {
      if (!rows[0]) return Promise.reject('Article not found');
      else return rows[0];
    });
};