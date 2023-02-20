const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const {
  articleData,
  commentData,
  topicData,
  userData,
} = require('../db/data/test-data/index');

beforeEach(() => {
  return seed({ articleData, commentData, topicData, userData });
});

afterAll(() => {
  return db.end();
});

describe('/api/topics', () => {
  describe('GET', () => {
    it('responds with an array of topic objects, each with slug and description properties', () => {
      return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).toEqual(topicData);
        });
    });
  });
});

describe('/api/articles', () => {
  describe('GET', () => {
    it(`responds with an array of article objects, each with author, title, article_id, topic, created_at, votes, article_img_url and comment_count properties`, () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(12);
          articles.forEach((article) => {
            expect(article).toMatchObject({
              article_id: expect.any(Number),
              author: expect.any(String),
              title: expect.any(String),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            });
          });
        });
    });
    it(`sorts the articles in descending date order by default`, () => {
      const expectedOrder = articleData.sort(
        (a, b) => b.created_at - a.created_at
      );
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          articles.forEach((article, i) =>
            expect(article.title).toBe(expectedOrder[i].title)
          );
        });
    });
    it(`correctly calculates the comment_count property`, () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles[0].comment_count).toBe(11);
        });
    });
  });
});

describe('/api/articles/:article_id/comments', () => {
  describe('GET', () => {
    it(`responds to a valid request with a 200 status code and an array of comment objects with comment_id, votes, created_at, author, body and article_id properties`, () => {
      return request(app)
        .get('/api/articles/5/comments')
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toBe(2);
          comments.forEach((comment) =>
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_id: 5,
            })
          );
        });
    });
    it(`responds to an invalid article_id with a 400 status code and an error message 'Invalid article ID`, () => {
      return request(app)
        .get('/api/articles/banana/comments')
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Invalid article ID');
        });
    });
    it(`responds to an article_id with no database entry with a 404 status code and an error message 'Article not found`, () => {
      return request(app)
        .get('/api/articles/9000/comments')
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Article not found');
        });
    });
    it(`responds to an article_id with no comments with a 404 status code and an error message 'Article has no comments`, () => {
      return request(app)
        .get('/api/articles/2/comments')
        .expect(404)
        .then(({ body }) => {
          console.log(body);
          const { msg } = body;
          expect(msg).toBe('Article has no comments');
        });
    });
  });
});
