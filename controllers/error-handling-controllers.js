exports.handlePSQL400Errors = (err, req, res, next) => {
  if (err.code === '22P02' || err.code === '23502') {
    console.log(400, err);
    res.status(400).send({ msg: 'Bad request' });
  } else next(err);
};

exports.handlePSQL404Errors = (err, req, res, next) => {
  if (err.code === '23503') {
    console.log(404, err);
    res.status(404).send({ msg: 'Not found' });
  } else next(err);
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    console.log(err.status, err.msg);
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.handleInvalidPath404Errors = (req, res) => {
  console.log(404, 'Invalid path');
  res.status(404).send({ msg: 'Not found' });
};

exports.handle500Errors = (err, req, res, next) => {
  console.log(500, err);
  res.status(500).send({ msg: 'Internal server error' });
};
