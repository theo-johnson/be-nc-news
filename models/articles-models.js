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

exports.fetchArticleComments = (article_id) => {
  if (isNaN(article_id)) return Promise.reject('Invalid article ID');
  return db
    .query('SELECT * FROM articles WHERE article_id = $1', [article_id])
    .then(({ rows }) => {
      if (!rows[0]) return Promise.reject('Article not found');
      const articleCommentsQueryString = `
      SELECT * FROM comments WHERE article_id = $1 
      ORDER BY created_at DESC;`;
      return db.query(articleCommentsQueryString, [article_id]);
    })
    .then(({ rows }) => {
      if (!rows[0]) return Promise.reject('Article has no comments');
      return rows;
    });
};

exports.fetchArticleById = (article_id) => {
  const articleQueryString = `
SELECT articles.article_id, articles.author, articles.topic, articles.title, 
articles.body, articles.created_at, articles.votes, articles.article_img_url, 
COUNT(comments.comment_id) AS comment_count
FROM articles FULL OUTER JOIN comments ON comments.article_id = articles.article_id
WHERE articles.article_id = $1
GROUP BY articles.article_id;`;

  return db.query(articleQueryString, [article_id]).then(({ rows }) => {
    if (!rows[0]) return Promise.reject('Article not found');
    else {
      rows[0].comment_count = +rows[0].comment_count;
      return rows[0];
    }
  });
};

exports.insertComment = (article_id, comment) => {
  const { body } = comment;
  const author = comment.username;
  const commentQueryString = `
INSERT INTO comments (body, author, article_id)
VALUES ($1, $2, $3)
RETURNING *;`;
  return db
    .query(commentQueryString, [body, author, article_id])
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.updateArticleById = (article_id, update) => {
  const updateQueryString = `
UPDATE articles SET votes = votes + $1 WHERE article_id = $2
RETURNING *;`;
  return db
    .query(updateQueryString, [update.inc_votes, article_id])
    .then(({ rows }) => {
      if (!rows[0]) return Promise.reject('Article not found');
      else
        return Promise.all([
          rows[0],
          db.query(
            `
SELECT COUNT(comments.comment_id) AS comment_count
FROM articles
FULL OUTER JOIN comments ON comments.article_id = articles.article_id
WHERE articles.article_id = $1
GROUP BY articles.article_id;`,
            [article_id]
          ),
        ]);
    })
    .then(([updatedArticle, { rows }]) => {
      updatedArticle.comment_count = +rows[0].comment_count;
      return updatedArticle;
    });
};
