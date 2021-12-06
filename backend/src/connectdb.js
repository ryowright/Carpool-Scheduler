const { Pool } = require('pg')
const bcrypt = require('bcrypt')
const format = require('pg-format')

const connectionString = process.env.DB_CONNECTION_STRING
const pool = new Pool({
  connectionString
})

const emails = [
  'dlucas@example.com', 'jmiller@example.com', 'jfuller@example.com', 'telliot@example.com',
  'ksnyder@example.com', 'mphillips@example.com', 'dwillis@example.com', 'nedwards@example.com',
  'awright@example.com'
]

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const toCampus = new Date()
const fromCampus = new Date()
toCampus.setHours(10)
toCampus.setMinutes(0)
toCampus.setSeconds(0)
fromCampus.setHours(16)
fromCampus.setMinutes(15)
fromCampus.setSeconds(0)

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
  await pool.query('DELETE FROM driver_carpool_schedules')
  await pool.query('DELETE FROM user_daily_schedules')
  await pool.query('DELETE FROM group_requests')
  await pool.query('DELETE FROM password_change_requests')
  await pool.query('DELETE FROM user_session_tokens')
  await pool.query('DELETE FROM users')
  await pool.query('DELETE FROM groups')

  // comment queries out when testing
  const hashedPassword = await bcrypt.hash('password', 8)

  // INSERTING TEST USERS
  await pool.query(`INSERT INTO users(email, firstname, lastname, 
  password, driver, carspace, school, is_verified) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
  ['ryow.college@gmail.com', 'Ryo', 'Wright', hashedPassword,
    false, null, 'University of California, Merced', true])
  
  // Inserting sample groups for development
  pool.query(`INSERT INTO groups(group_id_suffix, group_name, description, privacy, group_token)
  VALUES ($1, $2, $3, $4, $5) RETURNING id`, [1111, 'test group 1', 'This is the first group.', 'locked', '1111'], async (err, results) => {
    if (err) {
      throw new Error(err)
    }

    const groupId = results.rows[0].id
    const userValues = [
      ['dlucas@example.com', 'Derek', 'Lucas', hashedPassword, true, 4, 'UC Merced', true, groupId],
      ['jmiller@example.com', 'Judd', 'Miller', hashedPassword, true, 4, 'UC Merced', true, groupId],
      ['jfuller@example.com', 'Johnni', 'Fuller', hashedPassword, true, 4, 'UC Merced', true, groupId],
      ['telliot@example.com', 'Terry', 'Elliot', hashedPassword, true, 4, 'UC Merced', true, groupId],
      ['ksnyder@example.com', 'Kurt', 'Snyder', hashedPassword, true, 4, 'UC Merced', true, groupId],
      ['mphillips@example.com', 'Milton', 'Phillips', hashedPassword, true, 4, 'UC Merced', true, groupId],
      ['dwillis@example.com', 'Dianne', 'Willis', hashedPassword, false, null, 'UC Merced', true, groupId],
      ['nedwards@example.com', 'Nathan', 'Edwards', hashedPassword, true, 4, 'UC Merced', true, groupId],
      ['awright@example.com', 'Anthony', 'Wright', hashedPassword, false, null, 'UC Merced', true, groupId]
    ]
    
    const sql = format('INSERT INTO users(email, firstname, lastname, password, driver, carspace, school, is_verified, group_id) VALUES %L', userValues)
    pool.query(sql)

    for (const email of emails) {
      pool.query('SELECT id FROM users WHERE email = $1', [email], (err, emailResults) => {
        let currEmailId = emailResults.rows[0].id
        for (const day of days) {
          pool.query(`INSERT INTO user_daily_schedules(user_id, day, flexibility_early, flexibility_late, to_campus, from_campus)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [currEmailId, day, null, null, '08:30:00', '16:15:00'])
        }
      })
    }

    // PUT TWO SAMPLE USERS INTO SAME GROUP
    // pool.query(`INSERT INTO users(email, firstname, lastname, 
    // password, driver, carspace, school, is_verified, group_id) 
    // VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    // ['nathane@test.com', 'Nathan', 'Edwards', hashedPassword,
    //   true, 4, 'University of California, Merced', true, results.rows[0].id], async (err, resultsOne) => {
    //   if (err) {
    //     throw new Error(err)
    //   }

    //   await pool.query(`INSERT INTO user_daily_schedules(user_id, day, flexibility_early,
    //     flexibility_late, to_campus, from_campus) VALUES ($1, $2, $3, $4, $5, $6)`,
    //     [resultsOne.rows[0].id, 'Tuesday', null, null, toCampus.toLocaleTimeString(), fromCampus.toLocaleTimeString()])
    // })

    pool.query(`INSERT INTO users(email, firstname, lastname, 
    password, driver, carspace, school, is_verified, group_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    ['nhanc@test.com', 'Nhan', 'Cao', hashedPassword,
      true, 4, 'University of California, Merced', true, results.rows[0].id], async (err, resultsTwo) => {
      if (err) {
        throw new Error(err)
      }

      await pool.query(`INSERT INTO user_daily_schedules(user_id, day, flexibility_early,
        flexibility_late, to_campus, from_campus) VALUES ($1, $2, $3, $4, $5, $6)`,
        [resultsTwo.rows[0].id, 'Tuesday', null, null, toCampus.toLocaleTimeString(), fromCampus.toLocaleTimeString()])
    })

    pool.query(`INSERT INTO users(email, firstname, lastname, 
    password, driver, carspace, school, is_verified, group_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    ['johnv@test.com', 'John', 'Villalta', hashedPassword,
      true, 4, 'University of California, Merced', true, results.rows[0].id], async (err, resultsTwo) => {
      if (err) {
        throw new Error(err)
      }

      await pool.query(`INSERT INTO user_daily_schedules(user_id, day, flexibility_early,
        flexibility_late, to_campus, from_campus) VALUES ($1, $2, $3, $4, $5, $6)`,
        [resultsTwo.rows[0].id, 'Tuesday', null, null, toCampus.toLocaleTimeString(), fromCampus.toLocaleTimeString()])
    })
    
    await pool.query(`INSERT INTO users(email, firstname, lastname, 
    password, driver, carspace, school, is_verified, group_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    ['test@test.com', 'Test', 'User', hashedPassword,
      false, null, 'University of California, Merced', true, results.rows[0].id])
  })

  await pool.query(`INSERT INTO groups(group_id_suffix, group_name, description, privacy, group_token)
  VALUES ($1, $2, $3, $4, $5)`, [2222, 'test group 2', 'This is the second group.', 'locked', '2222'])

  await pool.query(`INSERT INTO groups(group_id_suffix, group_name, description, privacy, group_token)
  VALUES ($1, $2, $3, $4, $5)`, [3333, 'test group 3', 'This is the third group.', 'locked', '3333'])

  // INSERT SAMPLE SCHEDULES

  // INSERT SAMPLE MATCHES
  

})

console.log('Database setup')

module.exports = pool
