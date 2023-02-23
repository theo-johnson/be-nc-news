const {
  fetchArticles,
  fetchArticleComments,
  insertComment,
  fetchArticleById,
  updateArticleById,
  insertArticle,
} = require('../models/articles-models');

exports.getArticles = (req, res, next) => {
  let { topic, sort_by, order } = req.query;

  const validSortOptions = [
    'article_id',
    'author',
    'topic',
    'title',
    'created_at',
    'votes',
    'article_img_url',
    'comment_count',
  ];
  const validOrderOptions = ['asc', 'desc'];
  if (
    (sort_by && !validSortOptions.includes(sort_by)) ||
    (order && !validOrderOptions.includes(order))
  ) {
    next({ status: 400, msg: 'Bad request' });
  }

  fetchArticles(topic, sort_by, order)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleComments = (req, res, next) => {
  const article_id = +req.params.article_id;
  fetchArticleComments(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleById = (req, res, next) => {
  const article_id = +req.params.article_id;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (req, res, next) => {
  const article_id = +req.params.article_id;
  const comment = req.body;
  insertComment(article_id, comment)
    .then((postedComment) => {
      res.status(201).send({ postedComment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleById = (req, res, next) => {
  const article_id = +req.params.article_id;
  const update = req.body;
  updateArticleById(article_id, update)
    .then((updatedArticle) => {
      res.status(200).send({ updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (req, res, next) => {
  const article = req.body;
  insertArticle(article)
    .then((postedArticle) => {
      res.status(201).send({ postedArticle });
    })
    .catch((err) => {
      next(err);
    });
};
