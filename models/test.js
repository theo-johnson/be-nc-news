const db = require('../db/connection');

db.query(
  `
SELECT * FROM articles
WHERE article_id = $1
ORDER BY created_at $2`,
  [3, 'DESC']
).then(({ rows }) => {
  console.log(rows);
});
