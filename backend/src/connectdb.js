const { Pool } = require('pg')

const connectionString = process.env.DB_CONNECTION_STRING
const pool = new Pool({
    connectionString,
})

pool.connect(function(err) {
  if(err) {
    return console.error('could not connect to elephantsql', err);
  }
  pool.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
  });
});

console.log("Database setup");
console.log(process.env.DB_CONNECTION_STRING)

module.exports = pool