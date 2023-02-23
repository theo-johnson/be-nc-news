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
const { post } = require('../app');

beforeEach(() => {
  return seed({ articleData, commentData, topicData, userData });
});

afterAll(() => {
  return db.end();
});

describe('/api/<INVALID PATH>', () => {
  describe('ANY METHOD', () => {
    it('responds with a 404 status code and "Invalid path"', () => {
      return request(app)
        .get('/api/banana')
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Invalid path');
        });
    });
  });
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
    it(`responds with articles with the specified topic when ?topic query is added`, () => {
      return request(app)
        .get('/api/articles?topic=cats')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(1);
          expect(articles[0]).toMatchObject({
            article_id: 5,
            author: 'rogersop',
            title: 'UNCOVERED: catspiracy to bring down democracy',
            topic: 'cats',
            created_at: '2020-08-03T13:14:00.000Z',
            votes: 0,
            article_img_url:
              'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
            comment_count: expect.any(Number),
          });
        });
    });
    it(`responds with articles sorted by the specified column when ?sort_by query is added`, () => {
      return request(app)
        .get('/api/articles?topic=mitch&sort_by=title')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(11);
          expect(articles).toBeSortedBy('title', { descending: true });
        });
    });
    it(`accounts for the different column naming conventions (articles.title vs comment_count) when ?sort_by query is added`, () => {
      return request(app)
        .get('/api/articles?sort_by=comment_count')
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy('comment_count', { descending: true });
        });
    });
    it(`responds with articles sorted in the specified order when ?order query is added`, () => {
      return request(app)
        .get('/api/articles?topic=mitch&sort_by=title&order=asc')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(11);
          expect(articles).toBeSortedBy('title', { descending: false });
        });
    });
    it(`responds to an invalid ?sort_by query with a 400 status code and an error message 'Bad request`, () => {
      return request(app)
        .get('/api/articles?sort_by=banana')
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
    it(`responds to an invalid ?order query with a 400 status code and an error message 'Bad request`, () => {
      return request(app)
        .get('/api/articles?order=banana')
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
  });
});

describe('/api/articles/:article_id', () => {
  const articleObject = {
    article_id: 2,
    author: 'icellusedkars',
    title: 'A',
    topic: 'mitch',
    created_at: '2020-10-18T01:00:00.000Z',
    votes: 0,
    article_img_url:
      'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
  };
  describe('GET', () => {
    it(`responds to a valid request with a 200 status code and an article object with author, title, article_id, body, topic, created_at, votes, and article_img_url properties`, () => {
      return request(app)
        .get('/api/articles/2')
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject(articleObject);
        });
    });
    it(`responds to an invalid article_id with a 400 status code and an error message 'Bad request`, () => {
      return request(app)
        .get('/api/articles/banana')
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
    it(`responds to an article_id with no database entry with a 404 status code and an error message 'Not found`, () => {
      return request(app)
        .get('/api/articles/9000')
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Not found');
        });
    });
  });
  describe('PATCH', () => {
    const votesInput = { inc_votes: 3 };
    it(`responds to a valid request with a 200 status code and the article object with the vote count increased as specified`, () => {
      return request(app)
        .patch('/api/articles/2')
        .send(votesInput)
        .expect(200)
        .then(({ body }) => {
          const { updatedArticle } = body;
          const expected = { ...articleObject };
          expected.votes += 3;
          expect(updatedArticle).toMatchObject(expected);
        });
    });
    it(`responds to a valid request with a 200 status code and the article object with the vote count decreased as specified`, () => {
      return request(app)
        .patch('/api/articles/6')
        .send({ inc_votes: -2 })
        .expect(200)
        .then(({ body }) => {
          const { updatedArticle } = body;
          expect(updatedArticle.votes).toBe(98);
        });
    });
    it(`responds to an invalid article_id with a 400 status code and an error message 'Bad request`, () => {
      return request(app)
        .patch('/api/articles/banana')
        .send(votesInput)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
    it(`responds to an article_id with no database entry with a 404 status code and an error message 'Not found`, () => {
      return request(app)
        .patch('/api/articles/9000')
        .send(votesInput)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Not found');
        });
    });
    it(`responds to an invalid votes object with a 400 status code and an error message 'Bad request`, () => {
      const invalidVotes = {
        votes: '3',
      };
      return request(app)
        .patch('/api/articles/2')
        .send(invalidVotes)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
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
    it(`successfully adds valid comments to the database`, () => {
      return request(app)
        .post('/api/articles/2/comments')
        .send(commentInput)
        .expect(201)
        .then(({ body }) => {
          const { postedComment } = body;
          const { comment_id } = postedComment;
          return Promise.all([
            postedComment,
            db.query(`SELECT * FROM comments WHERE comment_id = $1`, [
              comment_id,
            ]),
          ]).then(([postedComment, { rows }]) => {
            rows[0].created_at = rows[0].created_at.toISOString();
            expect(rows[0]).toEqual(postedComment);
          });
        });
    });
    it(`responds to an invalid article_id with a 400 status code and an error message 'Bad request`, () => {
      return request(app)
        .post('/api/articles/banana/comments')
        .send(commentInput)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
    it(`responds to an article_id with no database entry with a 404 status code and an error message 'Not found`, () => {
      return request(app)
        .post('/api/articles/9000/comments')
        .send(commentInput)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Not found');
        });
    });
    it(`responds to an invalid comment object with a 400 status code and an error message 'Bad request`, () => {
      const invalidComment = {
        user: 'Tom',
        content: 3,
      };
      return request(app)
        .post('/api/articles/2/comments')
        .send(invalidComment)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
    it(`responds to a valid comment with a user not in database with a 404 status code and an error message 'Not found`, () => {
      const invalidComment = {
        username: 'Tom',
        body: 'Great article!',
      };
      return request(app)
        .post('/api/articles/2/comments')
        .send(invalidComment)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Not found');
        });
    });
  });
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
    it(`responds to a valid request with a 200 status code and comments newest comments first`, () => {
      return request(app)
        .get('/api/articles/5/comments')
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toBeSortedBy('created_at', { descending: true });
        });
    });
    it(`responds to an invalid article_id with a 400 status code and an error message 'Bad request`, () => {
      return request(app)
        .get('/api/articles/banana/comments')
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
    it(`responds to an article_id with no database entry with a 404 status code and an error message 'Not found`, () => {
      return request(app)
        .get('/api/articles/9000/comments')
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Not found');
        });
    });
  });
});

describe('/api/users', () => {
  describe('GET', () => {
    it.only('responds with an array of user objects, each with username, name and avatar_url properties', () => {
      return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body }) => {
          const { users } = body;
          expect(users.length).toBe(4);
          users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});
