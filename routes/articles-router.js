const {
  getArticles,
  getArticleComments,
  getArticleById,
  patchArticleById,
  postComment,
} = require('../controllers/articles-controllers');

const articlesRouter = require('express').Router();

articlesRouter.get('/', getArticles);
articlesRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(patchArticleById);

articlesRouter
  .route('/:article_id/comments')
  .get(getArticleComments)
  .post(postComment);

module.exports = articlesRouter;
