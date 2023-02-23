const {
  getArticles,
  getArticleComments,
  getArticleById,
  patchArticleById,
  postComment,
} = require('../controllers/articles-controllers');

const articlesRouter = require('express').Router();

articlesRouter.get('/articles', getArticles);
articlesRouter
  .route('/articles/:article_id')
  .get(getArticleById)
  .patch(patchArticleById);

articlesRouter
  .get('/articles/:article_id/comments', getArticleComments)
  .post(postComment);

module.exports = articlesRouter;
