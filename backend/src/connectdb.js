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
<<<<<<< HEAD
    console.log(result.rows[0].theTime);
    // >> output: 2018-08-23T14:02:57.117Z
  });
=======
    // pool.query('SELECT NOW() AS "theTime"', function(err, result) {
    //   if(err) {
    //     return console.error('error running query', err);
    //   }
    //   console.log(result.rows[0].theTime);
    //   // >> output: 2018-08-23T14:02:57.117Z
    // });
>>>>>>> 6e877f9a3c63e7ca6d26bef5f5677d46fe528ed3
});

console.log("Database setup");
console.log(process.env.DB_CONNECTION_STRING)

module.exports = pool