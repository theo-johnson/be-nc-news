exports.handle400Errors = (err, req, res, next) => {
  if (err === 'Invalid article ID') {
    console.log(400, '============');
    console.log(err);
    res.status(400).send({ msg: 'Invalid article ID' });
  } else next(err);
};

exports.handle404Errors = (err, req, res, next) => {
  if (err === 'Article not found') {
    console.log(404, '============');

    console.log(err);
    res.status(404).send({ msg: 'Article not found' });
  } else next(err);
};

exports.handle500Errors = (err, req, res, next) => {
  console.log(500, '============');
  console.log(err);
  res.status(500).send({ msg: 'Internal server error' });
};
