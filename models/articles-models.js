const db = require('../db/connection');

exports.fetchArticles = (topic, sort_by = 'created_at', order = 'desc') => {
  const queryValues = [];
  if (sort_by && sort_by !== 'comment_count') sort_by = `articles.${sort_by}`;

  let articlesQueryString = `
SELECT articles.article_id, articles.author, articles.topic, articles.title, 
articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count
FROM articles
FULL OUTER JOIN comments ON comments.article_id = articles.article_id`;
  if (topic) {
    queryValues.push(topic);
    articlesQueryString += `
WHERE articles.topic = $1`;
  }
  articlesQueryString += `
GROUP BY articles.article_id ORDER BY ${sort_by} ${order};`;

  return db.query(articlesQueryString, queryValues).then(({ rows }) => {
    if (!rows[0]) return Promise.reject('No articles found');
    else {
      rows.forEach((row) => (row.comment_count = +row.comment_count));
      return rows;
    }
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
SELECT article_id, author, topic, title, body,
created_at, votes, article_img_url
FROM articles
WHERE article_id = $1;`;

  return db.query(articleQueryString, [article_id]).then(({ rows }) => {
    if (!rows[0]) return Promise.reject('Article not found');
    else return rows[0];
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
