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
  describe('POST', () => {
    const topic = {
      slug: 'nephology',
      description: 'The study of clouds!',
    };
    it(`responds to a valid request with a 201 status code and the topic object that was successfully added`, () => {
      return request(app)
        .post('/api/topics')
        .send(topic)
        .expect(201)
        .then(({ body }) => {
          const { postedTopic } = body;
          expect(postedTopic).toEqual(topic);
        });
    });
    it(`responds to an invalid topic object with a 400 status code and an error message 'Bad request`, () => {
      const invalidTopic = {
        topic: 'Tom',
        content: 3,
      };
      return request(app)
        .post('/api/topics')
        .send(invalidTopic)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
  });
});
describe('/api/topics/:slug', () => {
  describe('DELETE', () => {
    it(`responds to a valid request with a 204 status code and successfully deletes the topic from the database`, () => {
      return request(app)
        .delete('/api/topics/cats')
        .expect(204)
        .then(({ body }) => {
          expect(body).toEqual({});
        });
    });
    it(`responds to a topic with no database entry with a 404 status code and an error message 'Not found`, () => {
      return request(app)
        .delete('/api/topics/9000')
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Not found');
        });
    });
  });
});

describe('/api/articles', () => {
  describe('GET', () => {
    it(`responds with an array of 10 article objects, each with author, title, article_id, topic, created_at, votes, article_img_url, comment_count and total_count properties when ?limit query is not specified`, () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(10);
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
              total_count: 12,
            });
          });
        });
    });
    it(`sorts the articles in descending date order by default`, () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy('created_at', { descending: true });
        });
    });
    it(`correctly calculates the comment_count property`, () => {
      return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles[0].comment_count).toBe(2);
        });
    });
    describe('?topic query', () => {
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
      it(`responds to a ?topic query with a topic not in database with a 404 status code and an error message 'Not found`, () => {
        return request(app)
          .get('/api/articles?topic=banana')
          .expect(404)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe('Not found');
          });
      });
    });
    describe('?author query', () => {
      it(`responds with articles with the specified author when ?author query is added`, () => {
        return request(app)
          .get('/api/articles?author=icellusedkars')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(6);
            articles.forEach((article) => {
              expect(article).toMatchObject({
                article_id: expect.any(Number),
                author: 'icellusedkars',
                title: expect.any(String),
                topic: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String),
                comment_count: expect.any(Number),
                total_count: 6,
              });
            });
          });
      });
      it(`responds to an ?author query with an author not in database with a 404 status code and an error message 'Not found`, () => {
        return request(app)
          .get('/api/articles?author=banana')
          .expect(404)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe('Not found');
          });
      });
    });
    describe('?sort_by query', () => {
      it(`responds with articles sorted by the specified column when ?sort_by query is added`, () => {
        return request(app)
          .get('/api/articles?topic=mitch&sort_by=title')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(10);
            expect(articles).toBeSortedBy('title', { descending: true });
          });
      });
      it(`accounts for the different column naming conventions (articles.title vs comment_count) when ?sort_by query is added`, () => {
        return request(app)
          .get('/api/articles?sort_by=comment_count')
          .then(({ body }) => {
            const { articles } = body;
            expect(articles).toBeSortedBy('comment_count', {
              descending: true,
            });
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
    });
    describe('?order query', () => {
      it(`responds with articles sorted in the specified order when ?order query is added`, () => {
        return request(app)
          .get('/api/articles?topic=mitch&sort_by=title&order=asc')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(10);
            expect(articles).toBeSortedBy('title', { descending: false });
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
    describe('?limit query', () => {
      it(`responds with a 200 status code and an array of x article objects when ?limit query is x`, () => {
        return request(app)
          .get('/api/articles?limit=3')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(3);
          });
      });
      it(`responds with a 200 status code and an array of all article objects if ?limit is greater than the total number of articles`, () => {
        return request(app)
          .get('/api/articles?limit=20')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(12);
          });
      });
      it(`responds to an invalid ?limit query with a 400 status code and an error message 'Bad request`, () => {
        return request(app)
          .get('/api/articles?limit=banana')
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe('Bad request');
          });
      });
    });
    describe('?p query', () => {
      it(`responds with a 200 status code and an array of <limit> article objects offset by x pages when ?p query is x,`, () => {
        return request(app)
          .get('/api/articles?sort_by=article_id&order=asc&limit=4&p=3')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(4);
            articles.forEach((article, index) =>
              expect(article.article_id).toBe(index + 9)
            );
          });
      });
      it(`responds with a 200 status code and an array of the first <limit> objects when ?p query is 0 or not supplied`, () => {
        return request(app)
          .get('/api/articles?sort_by=article_id&order=asc&limit=4')
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(4);
            articles.forEach((article, index) =>
              expect(article.article_id).toBe(index + 1)
            );
          });
      });
      it(`responds to an invalid ?p query with a 400 status code and an error message 'Bad request`, () => {
        return request(app)
          .get('/api/articles?p=banana')
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe('Bad request');
          });
      });
    });
  });
  describe('POST', () => {
    const article = {
      author: 'butter_bridge',
      title: 'The wonderful world of paper',
      topic: 'paper',
      body: 'Paper. We know it. We use it. But do we love it? In this essay I will explore...',
    };
    it(`responds to a valid request with a 201 status code and the article object that was successfully added, with database specific properties added`, () => {
      const articleWithURL = {
        ...article,
        article_img_url:
          'https://https://images.unsplash.com/photo-1520004434532-668416a08753',
      };
      return request(app)
        .post('/api/articles')
        .send(articleWithURL)
        .expect(201)
        .then(({ body }) => {
          const { postedArticle } = body;
          expect(postedArticle).toMatchObject({
            ...articleWithURL,
            article_id: 13,
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          });
        });
    });
    it(`responds to a valid request without an article_img_url with a 201 status code and the article object that was successfully added, with database specific properties added and article_img_url set to default`, () => {
      return request(app)
        .post('/api/articles')
        .send(article)
        .expect(201)
        .then(({ body }) => {
          const { postedArticle } = body;
          expect(postedArticle).toEqual({
            ...article,
            article_img_url:
              'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
            article_id: 13,
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          });
        });
    });
    it(`responds to an invalid article object with a 400 status code and an error message 'Bad request`, () => {
      const invalidArticle = {
        prop: 'banana',
        content: 3,
      };
      return request(app)
        .post('/api/articles')
        .send(invalidArticle)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
    it(`responds to a valid comment with a user not in database with a 404 status code and an error message 'Not found`, () => {
      const articleWithInvalidUser = { ...article };
      articleWithInvalidUser.author = 'banana';

      return request(app)
        .post('/api/articles')
        .send(articleWithInvalidUser)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Not found');
        });
    });
    it(`responds to a valid comment with a topic not in database with a 404 status code and an error message 'Not found`, () => {
      const articleWithInvalidTopic = { ...article };
      articleWithInvalidTopic.topic = 'banana';

      return request(app)
        .post('/api/articles')
        .send(articleWithInvalidTopic)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Not found');
        });
    });
  });
});

describe('/api/articles/:article_id', () => {
  const articleObject = {
    article_id: 2,
    author: 'icellusedkars',
    title: 'Sony Vaio; or, The Laptop',
    topic: 'mitch',
    created_at: '2020-10-16T05:03:00.000Z',
    votes: 0,
    article_img_url:
      'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
    comment_count: 0,
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
    describe('article_id = random', () => {
      it(`responds to a valid request to an article_id of random with a 200 status code and a random article object with author, title, article_id, body, topic, created_at, votes, and article_img_url properties`, () => {
        return request(app)
          .get('/api/articles/random')
          .expect(200)
          .then(({ body }) => {
            const { article } = body;
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
      describe('?topic query', () => {
        it(`responds with a random article with the specified topic when ?topic query is added`, () => {
          return request(app)
            .get('/api/articles/random?topic=cats')
            .expect(200)
            .then(({ body }) => {
              const { article } = body;
              expect(article).toMatchObject({
                article_id: expect.any(Number),
                author: expect.any(String),
                title: expect.any(String),
                topic: 'cats',
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String),
                comment_count: expect.any(Number),
              });
            });
        });
        it(`responds to a ?topic query with a topic not in database with a 404 status code and an error message 'Not found`, () => {
          return request(app)
            .get('/api/articles/random?topic=banana')
            .expect(404)
            .then(({ body }) => {
              const { msg } = body;
              expect(msg).toBe('Not found');
            });
        });
      });
    });
    describe('?current_user query', () => {
      it(`responds with a 200 status code and the specified article object with a current_user_voted property set to false, when there is no database record of the user having already voted on the specified article`, () => {
        return request(app)
          .get('/api/articles/2?current_user=butter_bridge')
          .expect(200)
          .then(({ body }) => {
            const { article } = body;
            expect(article.current_user_voted).toBe(false);
          });
      });
      it(`responds with a 200 status code and a random article object with a current_user_voted property set to false, when there is no database record of the user having already voted on the specified article and :article_id is 'random'`, () => {
        return request(app)
          .get('/api/articles/random?current_user=butter_bridge')
          .expect(200)
          .then(({ body }) => {
            const { article } = body;
            expect(article.current_user_voted).toBe(false);
          });
      });
      it(`responds with a 200 status code and the specified article object with a current_user_voted property set to the value of the vote (1 or -1), when there is a database record of the user having already voted on the specified article`, () => {
        return db
          .query(
            `
INSERT INTO users_article_votes (username, article_id, vote_value)
VALUES ('butter_bridge', 2 , -1);`
          )
          .then(() => {
            return request(app)
              .get('/api/articles/2?current_user=butter_bridge')
              .expect(200)
              .then(({ body }) => {
                const { article } = body;
                expect(article.current_user_voted).toBe(-1);
              });
          });
      });
    });
  });
  describe('PATCH', () => {
    const votesInput = { inc_votes: 3 };
    it(`responds to a valid request body with an inc_votes property with a 200 status code and the article object with the vote count increased as specified`, () => {
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
    it(`responds to a valid request with a negative inc_votes property with a 200 status code and the article object with the vote count decreased as specified`, () => {
      return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes: -2 })
        .expect(200)
        .then(({ body }) => {
          const { updatedArticle } = body;
          expect(updatedArticle.votes).toBe(98);
        });
    });
    it(`responds to a valid request with inc_votes and article_img_url properties with a 200 status code and the article object with the vote count incremented as specified, and the article_img_url updated`, () => {
      const imgURLInput = {
        inc_votes: 2,
        article_img_url:
          'https://images.unsplash.com/photo-1520004434532-668416a08753',
      };
      return request(app)
        .patch('/api/articles/2')
        .send(imgURLInput)
        .expect(200)
        .then(({ body }) => {
          const { updatedArticle } = body;
          const expected = { ...articleObject };
          expected.votes += 2;
          expected.article_img_url =
            'https://images.unsplash.com/photo-1520004434532-668416a08753';
          expect(updatedArticle).toMatchObject(expected);
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
    it(`responds to an invalid request body object with a 400 status code and an error message 'Bad request`, () => {
      const invalidVotes = {
        inc_votes: 'test',
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
  describe('DELETE', () => {
    it(`responds to a valid request with a 204 status code and successfully deletes the article from the database`, () => {
      return request(app)
        .delete('/api/articles/2')
        .expect(204)
        .then(({ body }) => {
          expect(body).toEqual({});
        });
    });
    it(`responds to an invalid article_id with a 400 status code and an error message 'Bad request`, () => {
      return request(app)
        .delete('/api/articles/banana')
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
    it(`responds to a article_id with no database entry with a 404 status code and an error message 'Not found`, () => {
      return request(app)
        .delete('/api/articles/9000')
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Not found');
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
    it(`responds to a valid request with a 200 status code and an array of 10 comment objects with comment_id, votes, created_at, author, body and article_id properties when ?limit query is not specified`, () => {
      return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toBe(10);
          comments.forEach((comment) =>
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_id: 1,
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
    describe('?limit query', () => {
      it(`responds with a 200 status code and an array of x comment objects when ?limit query is x`, () => {
        return request(app)
          .get('/api/articles/1/comments?limit=3')
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(3);
          });
      });
      it(`responds with a 200 status code and an array of all article objects if ?limit is greater than the total number of comments`, () => {
        return request(app)
          .get('/api/articles/1/comments?limit=20')
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(11);
          });
      });
      it(`responds to an invalid ?limit query with a 400 status code and an error message 'Bad request`, () => {
        return request(app)
          .get('/api/articles/1/comments?limit=banana')
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe('Bad request');
          });
      });
    });
    describe('?p query', () => {
      it(`responds with a 200 status code and an array of <limit> comment objects offset by x pages when ?p query is x,`, () => {
        return request(app)
          .get('/api/articles/1/comments?limit=4&p=3')
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(3);
            const expectedCommentIds = [3, 4, 9];
            comments.forEach((comment, index) =>
              expect(comment.comment_id).toBe(expectedCommentIds[index])
            );
          });
      });
      it(`responds with a 200 status code and an array of the first <limit> objects when ?p query is 0 or not supplied`, () => {
        return request(app)
          .get('/api/articles/1/comments?limit=4')
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(4);
            const expectedCommentIds = [5, 2, 18, 13];
            comments.forEach((comment, index) =>
              expect(comment.comment_id).toBe(expectedCommentIds[index])
            );
          });
      });
      it(`responds to an invalid ?p query with a 400 status code and an error message 'Bad request`, () => {
        return request(app)
          .get('/api/articles/1/comments?p=banana')
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe('Bad request');
          });
      });
    });
    describe('?order query', () => {
      it(`responds with comments sorted in the specified order when ?order query is added`, () => {
        return request(app)
          .get('/api/articles/1/comments?order=asc')
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(10);
            expect(comments).toBeSortedBy('created_at', { descending: false });
          });
      });
      it(`responds to an invalid ?order query with a 400 status code and an error message 'Bad request`, () => {
        return request(app)
          .get('/api/articles/1/comments?order=banana')
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe('Bad request');
          });
      });
    });
  });
});

describe('/api/comments/:comment_id', () => {
  describe('DELETE', () => {
    it(`responds to a valid request with a 204 status code and successfully deletes the comment from the database`, () => {
      return request(app)
        .delete('/api/comments/2')
        .expect(204)
        .then(({ body }) => {
          expect(body).toEqual({});
        });
    });
    it(`responds to an invalid comment_id with a 400 status code and an error message 'Bad request`, () => {
      return request(app)
        .delete('/api/comments/banana')
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
    it(`responds to a comment_id with no database entry with a 404 status code and an error message 'Not found`, () => {
      return request(app)
        .delete('/api/comments/9000')
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Not found');
        });
    });
  });
  describe('PATCH', () => {
    const votesInput = { inc_votes: 3 };
    it(`responds to a valid request with a 200 status code and the comment object with the vote count increased as specified`, () => {
      return request(app)
        .patch('/api/comments/2')
        .send(votesInput)
        .expect(200)
        .then(({ body }) => {
          const { updatedComment } = body;
          const expected = {
            comment_id: 2,
            body: 'The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.',
            author: 'butter_bridge',
            votes: 14,
            created_at: '2020-10-31T03:03:00.000Z',
          };
          expected.votes += 3;
          expect(updatedComment).toMatchObject(expected);
        });
    });
    it(`responds to a valid request with a 200 status code and the comment object with the vote count decreased as specified`, () => {
      return request(app)
        .patch('/api/comments/2')
        .send({ inc_votes: -2 })
        .expect(200)
        .then(({ body }) => {
          const { updatedComment } = body;
          expect(updatedComment.votes).toBe(12);
        });
    });
    it(`responds to an invalid article_id with a 400 status code and an error message 'Bad request`, () => {
      return request(app)
        .patch('/api/comments/banana')
        .send(votesInput)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
    it(`responds to an article_id with no database entry with a 404 status code and an error message 'Not found`, () => {
      return request(app)
        .patch('/api/comments/9000')
        .send(votesInput)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Not found');
        });
    });
    it(`responds to an invalid votes object with a 400 status code and an error message 'Bad request`, () => {
      const invalidVotes = {
        votes: 'three',
      };
      return request(app)
        .patch('/api/comments/2')
        .send(invalidVotes)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
  });
});

describe('/api/users', () => {
  describe('GET', () => {
    it('responds with an array of user objects, each with username, name and avatar_url properties', () => {
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
  describe('POST', () => {
    const user = {
      username: 'jmbo303',
      name: 'Jimbob',
      avatar_url:
        'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
    };
    it(`responds to a valid request with a 201 status code and the user object that was successfully added`, () => {
      return request(app)
        .post('/api/users')
        .send(user)
        .expect(201)
        .then(({ body }) => {
          const { postedUser } = body;
          expect(postedUser).toEqual(user);
        });
    });
    it(`responds to an invalid user object with a 400 status code and an error message 'Bad request`, () => {
      const invalidUser = {
        user: 'Tom',
        content: 3,
      };
      return request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Bad request');
        });
    });
  });
});

describe('/api/users/:username', () => {
  describe('GET', () => {
    it('responds with a user object with username, name and avatar_url properties', () => {
      return request(app)
        .get('/api/users/lurker')
        .expect(200)
        .then(({ body }) => {
          const { user } = body;
          expect(user).toMatchObject({
            username: 'lurker',
            name: 'do_nothing',
            avatar_url:
              'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
          });
        });
    });
    it('responds with a 404 status code and "Not found" when no user with the specified username exists in the database', () => {
      return request(app)
        .get('/api/users/banana')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual('Not found');
        });
    });
  });
  describe('DELETE', () => {
    it(`responds to a valid request with a 204 status code and successfully deletes the user from the database`, () => {
      return request(app)
        .delete('/api/users/rogersop')
        .expect(204)
        .then(({ body }) => {
          expect(body).toEqual({});
        });
    });
    it(`responds to a username with no database entry with a 404 status code and an error message 'Not found`, () => {
      return request(app)
        .delete('/api/users/9000')
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Not found');
        });
    });
  });
  describe('PATCH', () => {
    it(`responds with a 200 status code and an object with the requested username, article_id and vote_value properties when request body has an article_id property`, () => {
      const article_id = 2;
      return request(app)
        .patch('/api/users/butter_bridge')
        .send({ article_id, vote_value: 1 })
        .expect(200)
        .then(({ body }) => {
          const { updatedUser } = body;
          expect(updatedUser.article_id).toBe(2);
          expect(updatedUser.username).toBe('butter_bridge');
          expect(updatedUser.vote_value).toBe(1);
        });
    });
    it(`responds with a 200 status code and an object with the requested username, comment_id and vote_value properties when request body has an comment_id property`, () => {
      const comment_id = 2;
      return request(app)
        .patch('/api/users/butter_bridge')
        .send({ comment_id, vote_value: -1 })
        .expect(200)
        .then(({ body }) => {
          const { updatedUser } = body;
          expect(updatedUser.comment_id).toBe(2);
          expect(updatedUser.username).toBe('butter_bridge');
          expect(updatedUser.vote_value).toBe(-1);
        });
    });
    it(`'toggles' the user vote depending whether there is already a user vote for the specified article_id in the database, always maintaining just one row per username/id combination`, () => {
      const article_id = 2;
      return request(app)
        .patch('/api/users/butter_bridge')
        .send({ article_id, vote_value: 1 })
        .expect(200)
        .then(() =>
          db.query(`
SELECT * FROM users_article_votes
WHERE username = 'butter_bridge' AND article_id = 2;`)
        )
        .then(({ rows }) => {
          expect(rows.length).toBe(1);
          expect(rows[0].vote_value).toBe(1);
          return request(app)
            .patch('/api/users/butter_bridge')
            .send({ article_id, vote_value: 1 })
            .expect(200)
            .then(() =>
              db.query(`
SELECT * FROM users_article_votes
WHERE username = 'butter_bridge' AND article_id = 2;`)
            )
            .then(({ rows }) => {
              expect(rows.length).toBe(0);
            });
        });
    });
    it(`deletes any previous vote records for the specified username/id combination, so that vote_value is always 1 or -1`, () => {
      const article_id = 2;
      return request(app)
        .patch('/api/users/butter_bridge')
        .send({ article_id, vote_value: 1 })
        .expect(200)
        .then(() =>
          db.query(`
SELECT * FROM users_article_votes
WHERE username = 'butter_bridge' AND article_id = 2;`)
        )
        .then(({ rows }) => {
          expect(rows.length).toBe(1);
          expect(rows[0].vote_value).toBe(1);
          return request(app)
            .patch('/api/users/butter_bridge')
            .send({ article_id, vote_value: -1 })
            .expect(200)
            .then(() =>
              db.query(`
SELECT * FROM users_article_votes
WHERE username = 'butter_bridge' AND article_id = 2;`)
            )
            .then(({ rows }) => {
              expect(rows.length).toBe(1);
              expect(rows[0].vote_value).toBe(-1);
            });
        });
    });
  });
});

describe('/api', () => {
  describe('GET', () => {
    it('responds with an object with properties describing each endpoint', () => {
      return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
          const { endpoints } = body;
          expect(Object.keys(endpoints).length).toBe(18);
          Object.values(endpoints).forEach((endpoint) => {
            expect(endpoint).toMatchObject({
              description: expect.any(String),
            });
          });
        });
    });
  });
});
