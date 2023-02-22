# Northcoders News API

News aggregator API for node.js using the NC News database, where users can comment and vote on articles.

## Table of Contents

1.  [Documentation](#documentation)
    1.  [Installation](#installation)
    2.  [Endpoints](#examples)
    3.  [Testing](#objects)
2.  [Hosted Version](#hosted)
3.  [License](#support)

# Documentation

## Installation

---

### Dependencies:

Uses [PostgreSQL](https://www.postgresql.org/docs/current/) and [node-postgres](https://www.npmjs.com/package/pg) to handle queries to the NC News database. In the hosted version, this is hosted using [ElephantSQL](https://www.elephantsql.com/).

HTTP requests are handled using [Express](https://expressjs.com/) and [dotenv](https://www.npmjs.com/package/dotenv) is used to access environment variables.

The API has been tested with Node.js v19.3.0 and node-postgres v8.7.3. Earlier versions may work but are not officially supported.

Dependencies (required):

- [Express](https://expressjs.com/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [node-postgres](https://www.npmjs.com/package/pg)

Development dependencies (not required):

- [pg-format](https://www.npmjs.com/package/pg-format) (used for seeding the databases)
- [Jest](https://jestjs.io/) (used for unit and integration testing)
- [jest-sorted](https://www.npmjs.com/package/jest-sorted) (used for testing sort queries)
- [Supertest](https://www.npmjs.com/package/supertest) (used for making HTTP requests within Jest tests)

---

### Setup

---

#### 1. Clone repository

        git clone https://github.com/Carces/be-nc-news.git

#### 2. Install all required dependencies:

        npm install

#### 3. Set environment variables:

The API makes use of environment variables to access the PostgreSQL database. For this to function correctly, you will need to add a .env file to the root folder for each database you wish to connect to. These files need to contain the following line:

    PGDATABASE=<database_name_here>.

The database name depends on the database you are trying to connect to:

Test database:

- **.env file:** .env.test
- **PGDATABASE:** nc_news_test
- **Details:** Only accessible using a test suite, such as [Jest](https://jestjs.io/).

Development database:

- **.env file:** .env.development
- **PGDATABASE:** nc_news
- **Details:** Accesses the local PostgreSQL database

Production database:

- **.env file:** .env.production
- **PGDATABASE:** (hosted database URL)
- **Details:** Accesses the live hosted database

---

#### 4. Seed databases:

<br>
After adding your .env files, seed the database(s) you wish to use. Production database must be hosted before seeding.

Test:

        npm test app

Development:

        npm run seed

Production:

        npm run seed-prod

---

## Endpoints

---

The API has the following endpoints:

- **GET /api**

Serves up a JSON representation of all the available endpoints.

- **GET /api/topics**

Serves an array of all topics.

- **GET /api/articles**

Serves an array of article details, without article body text.

- **GET /api/articles/:article_id**

Serves the article with the specified article_id, with article body text.

- **PATCH /api/articles/:article_id**

Updates the article with the specified article_id, incrementing its votes property by the value of the inc_votes property of the request body object. Serves the updated article.

- **POST /api/articles/:article_id/comments**

Posts a new comment to the article with the specified article_id. Serves the posted comment.

- **GET /api/articles/:article_id/comments**

Serves an array of all comments on the article with the specified article_id.

- **GET /api/users**

Serves an array of all users.

---

## Testing

---

Existing tests can be run with

        npm test app

and

        npm test utils

These tests require Jest and Supertest as specified in [Dependencies](#dependencies).

Additional tests can be added to the \_\_tests\_\_ folder as needed, and can be run with the same commands.

Note that running tests with these commands will set PGDATABASE to test. You will therefore be connected to the nc_news_test database, which will be automatically seeded **before each test** with the data from **db/data/test-data**.

<br>

# Hosted Version

A working hosted version of this API can be found at

         https://nc-news-theo.onrender.com/

This link leads to the root "/" path of the API. Specific endpoints and queries can be appended to the URL to receive specific responses. For example:

        https://nc-news-theo.onrender.com/api/2/comments

This will serve an JSON object with a key of "comments", containing an array of all comments on the article with an article_id of 2.

<br>

# License

Copyright (c) 2023 Theo Johnson (GitHub: Carces)

Licensed under the MIT license.
