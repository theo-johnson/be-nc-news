const { Pool } = require('pg');
const ENV = process.env.NODE_ENV || 'development';
const dbURL = process.env.DATABASE_URL;

require('dotenv').config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE && !dbURL) {
  throw new Error('PGDATABASE or DATABASE_URL not set');
}

const config = ENV === 'production' ? { connectionString: dbURL, max: 2 } : {};

module.exports = new Pool(config);
