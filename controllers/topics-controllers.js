const { fetchTopics, insertTopic } = require('../models/topics-models');

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postTopic = (req, res, next) => {
  const { slug, description } = req.body;
  insertTopic(slug, description)
    .then((postedTopic) => {
      res.status(201).send({ postedTopic });
    })
    .catch((err) => {
      next(err);
    });
};
