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
  .route('/api/articles/:article_id')
  .get(getArticleById)
  .patch(patchArticleById);

articlesRouter
  .get('/api/articles/:article_id/comments', getArticleComments)
  .post(postComment);

module.exports = articlesRouter;
