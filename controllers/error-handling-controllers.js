exports.handlePSQL400Errors = (err, req, res, next) => {
  if (err.code === '22P02') {
    console.log(400, err);
    res.status(400).send({ msg: 'Invalid article ID' });
  } else if (err.code === '23502') {
    console.log(400, err);
    res.status(400).send({ msg: 'Invalid comment' });
  } else next(err);
};

exports.handlePSQL404Errors = (err, req, res, next) => {
  if (
    err.code === '23503' &&
    err.detail.endsWith('not present in table "users".')
  ) {
    console.log(404, err);
    res.status(404).send({ msg: 'Username not found' });
  } else if (err.code === '23503') {
    console.log(404, err);
    res.status(404).send({ msg: 'Article not found' });
  } else next(err);
};

exports.handleCustom400Errors = (err, req, res, next) => {
  if (err === 'Invalid article ID') {
    console.log(400, err);
    res.status(400).send({ msg: 'Invalid article ID' });
  } else if (err === 'Invalid sort_by column') {
    console.log(400, err);
    res.status(400).send({ msg: 'Invalid sort_by column' });
  } else if (err === 'Invalid sort order') {
    console.log(400, err);
    res.status(400).send({ msg: 'Invalid sort order' });
  } else next(err);
};

exports.handleCustom404Errors = (err, req, res, next) => {
  if (err === 'Article not found') {
    console.log(404, err);
    res.status(404).send({ msg: 'Article not found' });
  } else if (err === 'Article not found') {
    console.log(err);
    res.status(404).send({ msg: 'Article not found' });
  } else if (err === 'Article has no comments') {
    console.log(err);
    res.status(404).send({ msg: 'Article has no comments' });
  } else if (err === 'No articles found') {
    console.log(err);
    res.status(404).send({ msg: 'No articles found' });
  } else next(err);
};

exports.handleCustom500Errors = (err, req, res, next) => {
  console.log(500, err);
  res.status(500).send({ msg: 'Internal server error' });
};
