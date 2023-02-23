const {
  getArticles,
  getArticleComments,
  getArticleById,
  patchArticleById,
  postComment,
  postArticle,
  deleteArticleById,
  getRandomArticle,
} = require('../controllers/articles-controllers');

const articlesRouter = require('express').Router();

articlesRouter //
  .route('/')
  .get(getArticles)
  .post(postArticle);

articlesRouter.get('/articles/random', getRandomArticle);

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
