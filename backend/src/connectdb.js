const { Pool } = require('pg')
const bcrypt = require('bcrypt')

const connectionString = process.env.DB_CONNECTION_STRING
const pool = new Pool({
  connectionString
})

pool.connect(async function (err) {
  if (err) {
    return console.error('could not connect to elephantsql', err)
  }
  pool.query('SELECT NOW() AS "theTime"', function (err, result) {
    if (err) {
      return console.error('error running query', err)
    }
  })
  // Inserting sample user for development
  await pool.query('DELETE FROM password_change_requests')
  await pool.query('DELETE FROM user_session_tokens')
  await pool.query('DELETE FROM user_daily_schedules')
  await pool.query('DELETE FROM users')
  await pool.query('DELETE FROM groups')

  // comment queries out when testing
  const hashedPassword = await bcrypt.hash('password', 8)
  await pool.query(`INSERT INTO users(email, firstname, lastname, 
  password, driver, carspace, school, is_verified) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
  ['ryow.college@gmail.com', 'Ryo', 'Wright', hashedPassword,
    false, null, 'University of California, Merced', true])

  // Inserting sample groups for development
  await pool.query(`INSERT INTO groups(group_id_suffix, group_name, description, privacy, group_token)
  VALUES ($1, $2, $3, $4, $5)`, [1111, 'test group 1', 'This is the first group.', 'locked', '1111'])

  await pool.query(`INSERT INTO groups(group_id_suffix, group_name, description, privacy, group_token)
  VALUES ($1, $2, $3, $4, $5)`, [2222, 'test group 2', 'This is the second group.', 'locked', '2222'])

  await pool.query(`INSERT INTO groups(group_id_suffix, group_name, description, privacy, group_token)
  VALUES ($1, $2, $3, $4, $5)`, [3333, 'test group 3', 'This is the third group.', 'locked', '3333'])
})

console.log('Database setup')

module.exports = pool
