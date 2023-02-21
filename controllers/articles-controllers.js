const {
  fetchArticles,
  fetchArticleComments,
  insertComment,
  fetchArticleById,
  updateArticleById,
} = require('../models/articles-models');

exports.getArticles = (req, res, next) => {
  fetchArticles()
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
      res.status(201).send({ updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};
