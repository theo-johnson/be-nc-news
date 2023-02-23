const {
  getArticles,
  getArticleComments,
  getArticleById,
  patchArticleById,
  postComment,
  postArticle,
} = require('../controllers/articles-controllers');

const articlesRouter = require('express').Router();

articlesRouter //
  .route('/')
  .get(getArticles)
  .post(postArticle);

articlesRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(patchArticleById);

articlesRouter
  .route('/:article_id/comments')
  .get(getArticleComments)
  .post(postComment);

module.exports = articlesRouter;
