# Northcoders News API

## Setup

This API makes use of environment variables to access the necessary PostgreSQL databases. For this to function correctly, you will have to add .env files to the root folder for each database. These files need to contain the following line: PGDATABASE=<database_name_here>. You should create a .env.test file for connecting to the test database, and a .env.development file for connecting to the development database. The default database names are nc_news for dev data and nc_news_test for test data.
