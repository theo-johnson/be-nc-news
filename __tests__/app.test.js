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

describe('/api/articles/:article_id', () => {
  describe('GET', () => {
    it(`responds to a valid request with a 200 status code and an article object with author, title, article_id, body, topic, created_at, votes, and article_img_url properties`, () => {
      return request(app)
        .get('/api/articles/2')
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            article_id: 2,
            author: 'icellusedkars',
            title: 'A',
            topic: 'mitch',
            created_at: '2020-10-18T01:00:00.000Z',
            votes: 0,
            article_img_url:
              'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
          });
        });
    });
    it(`responds to an invalid article_id with a 400 status code and an error message 'Invalid article ID`, () => {
      return request(app)
        .get('/api/articles/banana')
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Invalid article ID');
        });
    });
    it(`responds to an article_id with no database entry with a 404 status code and an error message 'Article not found`, () => {
      return request(app)
        .get('/api/articles/9000')
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Article not found');
        });
    });
  });
});

describe('/api/articles/:article_id/comments', () => {
  describe('POST', () => {
    const commentInput = {
      username: 'butter_bridge',
      body: 'Loved it, great article!',
    };
    it(`responds to a valid request with a 201 status code and the comment object that was successfully added`, () => {
      return request(app)
        .post('/api/articles/2/comments')
        .send(commentInput)
        .expect(201)
        .then(({ body }) => {
          const { postedComment } = body;
          expect(postedComment).toMatchObject({
            comment_id: expect.any(Number),
            author: 'butter_bridge',
            created_at: expect.any(String),
            votes: 0,
            body: 'Loved it, great article!',
            article_id: 2,
          });
        });
    });
  });
});
