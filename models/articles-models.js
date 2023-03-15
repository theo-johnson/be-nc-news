const db = require('../db/connection');

exports.fetchArticles = (
  topic,
  author,
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
  if (author) {
    queryValues.push(author);
    queryCount++;
    articlesQueryString += topic ? ' AND' : ' WHERE';
    articlesQueryString += `
articles.author = $${queryCount}`;
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
    if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });
    rows.forEach((row) => {
      row.comment_count = +row.comment_count;
      row.total_count = +row.total_count;
    });
    return rows;
  });
};

exports.fetchArticleComments = (
  article_id,
  order = 'DESC',
  limit = 10,
  p = 1
) => {
  return db
    .query('SELECT * FROM articles WHERE article_id = $1', [article_id])
    .then(({ rows }) => {
      if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });

      const offset = (p - 1) * limit;
      const articleCommentsQueryString = `
      SELECT * FROM comments WHERE article_id = $1 
      ORDER BY created_at ${order}
      LIMIT $2 OFFSET $3;`;

      return db.query(articleCommentsQueryString, [article_id, limit, offset]);
    })
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchArticleById = (article_id, current_user) => {
  const articleQueryString = `
SELECT articles.article_id, articles.author, articles.topic, articles.title, 
articles.body, articles.created_at, articles.votes, articles.article_img_url, 
COUNT(comments.comment_id) AS comment_count
FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id
WHERE articles.article_id = $1
GROUP BY articles.article_id;`;
  return db.query(articleQueryString, [article_id]).then(({ rows }) => {
    if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });
    rows[0].comment_count = +rows[0].comment_count;
    if (!current_user) return rows[0];

    const checkCurrentUserVotedQuery = `
SELECT * FROM users_article_votes
WHERE username = $1 AND article_id = $2;`;
    return Promise.all([
      rows[0],
      db.query(checkCurrentUserVotedQuery, [current_user, article_id]),
    ]).then(([article, { rows }]) => {
      article.current_user_voted = !rows.length ? false : rows[0].vote_value;
      return article;
    });
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

exports.updateArticleById = (article_id, inc_votes, article_img_url) => {
  const updateValues = [];
  let updateCount = 0;
  let updateQueryString = `
UPDATE articles SET`;
  if (inc_votes) {
    updateValues.push(inc_votes);
    updateCount++;
    updateQueryString += `
votes = votes + $${updateCount}`;
  }
  if (article_img_url) {
    if (inc_votes) updateQueryString += `,`;
    updateValues.push(article_img_url);
    updateCount++;
    updateQueryString += `
article_img_url = $${updateCount}`;
  }
  updateValues.push(article_id);
  updateCount++;
  updateQueryString += `
WHERE article_id = $${updateCount} RETURNING *;`;

  return db
    .query(updateQueryString, updateValues)
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

exports.deleteArticleFromDb = (article_id) => {
  const deleteArticleQueryString = `
DELETE FROM articles
WHERE article_id = $1
RETURNING *;`;
  return db.query(deleteArticleQueryString, [article_id]).then(({ rows }) => {
    if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });
    return;
  });
};

exports.fetchRandomArticle = (topic, current_user) => {
  const queryValues = [];
  let articleQueryString = `
SELECT articles.article_id, articles.author, articles.topic, articles.title,
articles.body, articles.created_at, articles.votes, articles.article_img_url,
COUNT(comments.comment_id) AS comment_count
FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id`;
  if (topic) {
    queryValues.push(topic);
    articleQueryString += `
WHERE articles.topic = $1`;
  }
  articleQueryString += `
GROUP BY articles.article_id
ORDER BY RANDOM() LIMIT 1;`;

  return db.query(articleQueryString, queryValues).then(({ rows }) => {
    if (!rows[0]) return Promise.reject({ status: 404, msg: 'Not found' });

    rows[0].comment_count = +rows[0].comment_count;
    if (!current_user) return rows[0];

    const checkCurrentUserVotedQuery = `
SELECT * FROM users_article_votes
WHERE username = $1 AND article_id = $2;`;
    return Promise.all([
      rows[0],
      db.query(checkCurrentUserVotedQuery, [current_user, rows[0].article_id]),
    ]).then(([article, { rows }]) => {
      article.current_user_voted = !rows.length ? false : rows[0].vote_value;
      return article;
    });
  });
};
