const db = require('../db/connection');

exports.fetchArticles = (
  topic,
  sort_by = 'created_at',
  order = 'DESC',
  limit = 10,
  p = 1
) => {
  const queryValues = [];
  let queryCount = 0;
  if (sort_by && sort_by !== 'comment_count') sort_by = `articles.${sort_by}`;
  const offset = (p - 1) * limit;

  let articlesQueryString = `
SELECT articles.article_id, articles.author, articles.topic, articles.title, 
articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count, COUNT(articles.article_id) OVER() AS total_count
FROM articles
LEFT JOIN comments ON comments.article_id = articles.article_id`;
  if (topic) {
    queryValues.push(topic);
    queryCount++;
    articlesQueryString += `
WHERE articles.topic = $${queryCount}`;
  }
  articlesQueryString += `
GROUP BY articles.article_id ORDER BY ${sort_by} ${order}`;
  queryValues.push(limit);
  queryCount++;
  articlesQueryString += `
LIMIT $${queryCount}`;
  queryValues.push(offset);
  queryCount++;
  articlesQueryString += `
OFFSET $${queryCount}`;

  return db.query(articlesQueryString, queryValues).then(({ rows }) => {
    rows.forEach((row) => {
      row.comment_count = +row.comment_count;
      row.total_count = +row.total_count;
    });
    return rows;
  });
};

exports.fetchArticleComments = (article_id) => {
  return db
    .query('SELECT * FROM articles WHERE article_id = $1', [article_id])
    .then(({ rows }) => {
      if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });
      const articleCommentsQueryString = `
      SELECT * FROM comments WHERE article_id = $1 
      ORDER BY created_at DESC;`;
      return db.query(articleCommentsQueryString, [article_id]);
    })
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchArticleById = (article_id) => {
  const articleQueryString = `
SELECT articles.article_id, articles.author, articles.topic, articles.title, 
articles.body, articles.created_at, articles.votes, articles.article_img_url, 
COUNT(comments.comment_id) AS comment_count
FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id
WHERE articles.article_id = $1
GROUP BY articles.article_id;`;

  return db.query(articleQueryString, [article_id]).then(({ rows }) => {
    if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });
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
      if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });
      else
        return Promise.all([
          rows[0],
          db.query(
            `
SELECT COUNT(comments.comment_id) AS comment_count
FROM articles
LEFT JOIN comments ON comments.article_id = articles.article_id
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

exports.insertArticle = (article) => {
  const {
    title,
    topic,
    author,
    body,
    article_img_url = 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
  } = article;

  const articleQueryString = `
INSERT INTO articles (title, topic, author, body, article_img_url)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;`;
  return db
    .query(articleQueryString, [title, topic, author, body, article_img_url])
    .then(({ rows }) => {
      if (!rows[0]) return Promise.reject('Article not posted');
      return { ...rows[0], comment_count: 0 };
    });
};

//     const { article_id } = rows[0];
//       const commentCountQueryString = `
// SELECT articles.article_id, COUNT(comments.comment_id) AS comment_count
// FROM articles
// LEFT JOIN comments ON comments.article_id = articles.article_id
// WHERE articles.article_id = $1
// GROUP BY articles.article_id;`;
//       return Promise.all([
//         db.query(commentCountQueryString, [article_id]),
//         rows[0],
//       ]);
//     })
//     .then(([{ rows }, insertedArticle]) => {
//       insertedArticle.comment_count = rows[0].comment_count;
//       return insertedArticle;
//     });
