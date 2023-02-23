const {
  getArticles,
  getArticleComments,
  getArticleById,
  patchArticleById,
  postComment,
  postArticle,
  deleteArticleById,
} = require('../controllers/articles-controllers');

const articlesRouter = require('express').Router();

articlesRouter //
  .route('/')
  .get(getArticles)
  .post(postArticle);

articlesRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(patchArticleById)
  .delete(deleteArticleById);

articlesRouter
  .route('/:article_id/comments')
  .get(getArticleComments)
  .post(postComment);

module.exports = articlesRouter;
