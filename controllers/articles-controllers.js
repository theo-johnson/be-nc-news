const {
  fetchArticles,
  fetchArticleComments,
  insertComment,
  fetchArticleById,
  updateArticleById,
  insertArticle,
  deleteArticleFromDb,
  fetchRandomArticle,
} = require('../models/articles-models');

exports.getArticles = (req, res, next) => {
  let { topic, author, sort_by, order, limit, p } = req.query;

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
    (sort_by && !validSortOptions.includes(sort_by.toLowerCase())) ||
    (order && !validOrderOptions.includes(order.toLowerCase()))
  ) {
    next({ status: 400, msg: 'Bad request' });
  }

  fetchArticles(topic, author, sort_by, order, limit, p)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleComments = (req, res, next) => {
  let { order, limit, p } = req.query;
  const article_id = +req.params.article_id;

  const validOrderOptions = ['asc', 'desc'];
  if (order && !validOrderOptions.includes(order.toLowerCase()))
    next({ status: 400, msg: 'Bad request' });

  fetchArticleComments(article_id, order, limit, p)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleById = (req, res, next) => {
  let article_id = req.params.article_id;
  const { topic, current_user } = req.query;

  if (article_id === 'random') {
    fetchRandomArticle(topic, current_user)
      .then((article) => {
        res.status(200).send({ article });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    article_id = +article_id;
    fetchArticleById(article_id, current_user)
      .then((article) => {
        res.status(200).send({ article });
      })
      .catch((err) => {
        next(err);
      });
  }
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
  const { inc_votes, article_img_url } = req.body;
  updateArticleById(article_id, inc_votes, article_img_url)
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

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;
  deleteArticleFromDb(article_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.getRandomArticle = (req, res, next) => {
  fetchRandomArticle()
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
