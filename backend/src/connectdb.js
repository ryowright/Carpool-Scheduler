const { Pool } = require('pg')
const bcrypt = require('bcrypt')

const connectionString = process.env.DB_CONNECTION_STRING
const pool = new Pool({
    connectionString,
})

pool.connect(async function(err) {
  if(err) {
    return console.error('could not connect to elephantsql', err);
  }
  pool.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
  });
  // Inserting sample user for development

  // const hashedPassword = await bcrypt.hash('password', 8)
  // await pool.query(`DELETE FROM users`)
  // pool.query(`INSERT INTO users(email, firstname, lastname, 
  //   password, type, carspace, school, is_verified) 
  //   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
  //   ['ryo@example.com', 'Ryo', 'Wright', hashedPassword, 
  //    'carpooler', null, 'University of California, Merced', true])
});

console.log("Database setup");

module.exports = pool