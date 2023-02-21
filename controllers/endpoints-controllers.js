const { fetchEndpoints } = require('../models/endpoints-models');

exports.getEndpoints = (req, res, next) => {
  const endpoints = fetchEndpoints();
  console.log(endpoints, ' <<<<<<<<<<<<<<< ');
  res.status(200).send({ endpoints });
};
