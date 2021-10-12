const request = require('supertest')
const pool = require('../src/connectdb')
const app = require('../src/app')
const bcrypt = require('bcrypt')

const path = '/api/schedule'
const loginPath = '/api/user/login'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const user = {
  email: 'ryow.college@gmail.com',
  firstname: 'Ryo',
  lastname: 'Wright',
  password: 'testpassword',
  driver: false,
  school: 'University of California, Merced',
  isVerified: true
}

const secondUser = {
  email: 'test@example.com',
  firstname: 'John',
  lastname: 'Wayne',
  password: 'testpassword',
  driver: true,
  carspace: 4,
  school: 'University of California, Merced',
  isVerified: true
}

const mondayTo = new Date()
const mondayFrom = new Date()

mondayTo.setHours(8)
mondayTo.setMinutes(30)
mondayTo.setSeconds(0)

mondayFrom.setHours(16)
mondayFrom.setMinutes(15)
mondayFrom.setSeconds(0)

const schedule = {
  day: 'Monday',
  flexibilityEarly: 30,
  flexibilityLate: 30,
  toCampus: mondayTo,
  fromCampus: mondayFrom
}

const scheduleTwo = {
  day: 'Tuesday',
  flexibilityEarly: 30,
  flexibilityLate: 30,
  toCampus: mondayTo,
  fromCampus: mondayFrom
}

/* FOR TESTING MATCHING SYSTEM */
const mondayToDriver = new Date()
const mondayFromDriver = new Date()
mondayToDriver.setHours(8)
mondayToDriver.setMinutes(0)
mondayToDriver.setSeconds(0)
mondayFromDriver.setHours(16)
mondayFromDriver.setMinutes(30)
mondayFromDriver.setSeconds(0)

const carpoolerSchedule = {
  day: 'Wednesday',
  flexibilityEarly: 30,
  flexibilityLate: 30,
  toCampus: mondayTo,
  fromCampus: mondayFrom
}

const driverSchedule = {
  day: 'Wednesday',
  flexibilityEarly: null,
  flexibilityLate: null,
  toCampus: mondayToDriver,
  fromCampus: mondayFromDriver
}
/* ----------------------------- */

beforeAll(async () => {
  await pool.query('DELETE FROM driver_carpool_schedules')
  await pool.query('DELETE FROM user_daily_schedules')
  await pool.query('DELETE FROM group_requests')
  await pool.query('DELETE FROM password_change_requests')
  await pool.query('DELETE FROM user_session_tokens')
  await pool.query('DELETE FROM users')
  await pool.query('DELETE FROM groups')
})

beforeEach(async () => {
  const hashedPassword = await bcrypt.hash(user.password, 8)

  pool.query(`INSERT INTO groups(group_id_suffix, group_name, description, privacy, group_token)
  VALUES ($1, $2, $3, $4, $5) RETURNING id`, [1111, 'test group 1', 'This is the first group.', 'locked', '1111'],
  (err, resultsOne) => {
    if (err) {
      throw new Error(err)
    }
    // Insert sample carpooler
    pool.query(`INSERT INTO users(email, firstname, lastname, password, driver, school, is_verified, group_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [user.email, user.firstname, user.lastname, hashedPassword, user.driver, user.school, user.isVerified, resultsOne.rows[0].id],
    (err, resultsTwo) => {
      if (err) {
        throw new Error(err)
      }

      pool.query(`INSERT INTO user_daily_schedules(user_id, day, flexibility_early, flexibility_late, to_campus, from_campus)
        VALUES ($1, $2, $3, $4, $5, $6)`, [resultsTwo.rows[0].id, 'Tuesday', scheduleTwo.flexibilityEarly, scheduleTwo.flexibilityLate,
        scheduleTwo.toCampus.toLocaleTimeString(), scheduleTwo.fromCampus.toLocaleTimeString()]
      )

      // carpooler schedule
      pool.query(`INSERT INTO user_daily_schedules(user_id, day, flexibility_early, flexibility_late, to_campus, from_campus)
        VALUES ($1, $2, $3, $4, $5, $6)`, [resultsTwo.rows[0].id, carpoolerSchedule.day, carpoolerSchedule.flexibilityEarly,
        carpoolerSchedule.flexibilityLate, carpoolerSchedule.toCampus.toLocaleTimeString(), carpoolerSchedule.fromCampus.toLocaleTimeString()]
      )
    })
    // Insert sample driver
    pool.query(`INSERT INTO users(email, firstname, lastname, password, driver, school, is_verified, group_id, carspace)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [secondUser.email, secondUser.firstname, secondUser.lastname, hashedPassword, secondUser.driver, secondUser.school,
      secondUser.isVerified, resultsOne.rows[0].id, secondUser.carspace], (err, resultsFour) => {
      if (err) {
        throw new Error(err)
      }

      // driver schedule
      pool.query(`INSERT INTO user_daily_schedules(user_id, day, flexibility_early, flexibility_late, to_campus, from_campus)
        VALUES ($1, $2, $3, $4, $5, $6)`, [resultsFour.rows[0].id, driverSchedule.day, driverSchedule.flexibilityEarly,
        driverSchedule.flexibilityLate, driverSchedule.toCampus.toLocaleTimeString(), driverSchedule.fromCampus.toLocaleTimeString()])
    }
    )
  })
})

afterEach(async () => {
  await pool.query('DELETE FROM driver_carpool_schedules')
  await pool.query('DELETE FROM user_daily_schedules')
  await pool.query('DELETE FROM group_requests')
  await pool.query('DELETE FROM password_change_requests')
  await pool.query('DELETE FROM user_session_tokens')
  await pool.query('DELETE FROM users')
  await pool.query('DELETE FROM groups')
})

afterAll(() => {
  pool.end()
})

/* --- POSSIBLE INPUTS TO THIS API: --- */
// day
// flexibility_early
// flexibility_late
// to_campus_time
// from_campus_time
// user_id
// schedule_id
/* ------------------------------------ */

describe('Testing User Daily Schedule Creation', () => {
  test('Successfully create a daily schedule', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).post(path + '/create')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({ ...schedule })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(`Successfully set schedule for ${schedule.day}`)
    expect(res.body.schedule).toEqual({
      id: expect.any(Number),
      user_id: expect.any(Number),
      day: expect.any(String),
      flexibility_early: expect.any(Number),
      flexibility_late: expect.any(Number),
      to_campus: expect.any(String),
      from_campus: expect.any(String)
    })
  })

  test('Should fail -- Schedule already exists for given day for user', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    await request(app).post(path + '/create')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({ ...schedule })

    const res = await request(app).post(path + '/create')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({ ...schedule })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe(`Schedule already exists for ${schedule.day}`)
  })

  test('Should fail -- Invalid day', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).post(path + '/create')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({ ...schedule, day: 'invalid' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid value set for day.')
  })

  test('Should fail -- To campus time is later than from campus', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const toCampusTime = new Date()
    const fromCampusTime = new Date()

    toCampusTime.setHours(16)
    toCampusTime.setMinutes(30)
    toCampusTime.setSeconds(0)

    fromCampusTime.setHours(9)
    fromCampusTime.setMinutes(30)
    fromCampusTime.setSeconds(0)

    const res = await request(app).post(path + '/create')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({ ...schedule, toCampus: toCampusTime, fromCampus: fromCampusTime })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('to_campus time should not be later than from_campus time.')
  })

  test('Should fail -- Flexibility time(s) is greater than three hours', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).post(path + '/create')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({ ...schedule, flexibilityEarly: 190 })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Flexibility time(s) should not be greater than 3 hours.')
  })

  test('Should fail -- User is not authenticated', async () => {
    const res = await request(app).post(path + '/create')
      .set({ Authorization: 'Bearer invalidtoken' })
      .send({ ...schedule })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid token.')
  })
})

// INPUTS: day
describe('Testing User Individual Daily Schedule Retrieval', () => {
  test('Successfully retrieve a daily schedule', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).get(path + `/get-one?day=${scheduleTwo.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(`Successfully retrieved user's schedule for ${scheduleTwo.day}`)
    expect(res.body.schedule).toEqual({
      id: expect.any(Number),
      user_id: expect.any(Number),
      day: expect.any(String),
      flexibility_early: expect.any(Number),
      flexibility_late: expect.any(Number),
      to_campus: expect.any(String),
      from_campus: expect.any(String)
    })
  })

  test('Should fail -- Invalid day', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).get(path + '/get-one?day=invalidday')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Value for query field \'day\' is invalid or missing.')
  })

  test('Should fail -- Missing day', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).get(path + '/get-one?day=')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Value for query field \'day\' is invalid or missing.')
  })

  test('Should fail -- User is not authenticated', async () => {
    const res = await request(app).get(path + `/get-one?day=${schedule.day}`)
      .set({ Authorization: 'Bearer invalidtoken' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid token.')
  })
})

// INPUTS:
describe('Testing User All Schedule Retrieval', () => {
  test('Successfully get daily schedules for each day for a user', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).get(path + '/get-all')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe('Successfully retrieved all of user\'s daily schedules.')
    expect(res.body.schedules).toContainEqual(
      expect.objectContaining({
        id: expect.any(Number),
        user_id: expect.any(Number),
        day: expect.any(String),
        flexibility_early: expect.any(Number),
        flexibility_late: expect.any(Number),
        to_campus: expect.any(String),
        from_campus: expect.any(String)
      })
    )
  })

  test('Should fail -- User is not authenticated', async () => {
    const res = await request(app).get(path + '/get-all')
      .set({ Authorization: 'Bearer invalidtoken' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid token.')
  })
})

// INPUTS: all possible inputs
describe('Testing User Daily Schedule Updating', () => {
  test('Successfully update a daily schedule for a user', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).patch(path + '/update-one')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({ ...scheduleTwo })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(`Successfully updated user's daily schedule for ${scheduleTwo.day}`)
    expect(res.body.schedule).toEqual({
      id: expect.any(Number),
      user_id: expect.any(Number),
      day: expect.any(String),
      flexibility_early: expect.any(Number),
      flexibility_late: expect.any(Number),
      to_campus: expect.any(String),
      from_campus: expect.any(String)
    })
  })

  test('Should fail -- Invalid day', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).patch(path + '/update-one')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({ ...scheduleTwo, day: 'invalidday' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Value for query field \'day\' is invalid.')
  })

  test('Should fail -- To campus time is later than from campus', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const toCampusTime = new Date()
    const fromCampusTime = new Date()

    toCampusTime.setHours(16)
    toCampusTime.setMinutes(30)
    toCampusTime.setSeconds(0)

    fromCampusTime.setHours(9)
    fromCampusTime.setMinutes(30)
    fromCampusTime.setSeconds(0)

    const res = await request(app).patch(path + '/update-one')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({ ...scheduleTwo, toCampus: toCampusTime, fromCampus: fromCampusTime })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('to_campus time should not be later than from_campus time.')
  })

  test('Should fail -- Flexibility time(s) is greater than three hours', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).patch(path + '/update-one')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({ ...scheduleTwo, flexibilityEarly: 190 })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Flexibility time(s) should not be greater than 3 hours.')
  })

  test('Should fail -- User is not authenticated', async () => {
    const res = await request(app).patch(path + '/update-one')
      .set({ Authorization: 'Bearer invalidtoken' })
      .send({ ...scheduleTwo })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid token.')
  })
})

// INPUTS: schedule_id
describe('Testing User Daily Schedule Removal', () => {
  test('Successfully remove a daily schedule for a user', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const getRes = await request(app).get(path + `/get-one?day=${scheduleTwo.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    const res = await request(app).delete(path + '/remove-one')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({ scheduleId: getRes.body.schedule.id })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(`Successfully deleted user's daily schedule for ${scheduleTwo.day}`)
  })

  test('Should fail -- Schedule does not exist', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).delete(path + '/remove-one')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({ scheduleId: -1 })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Daily schedule does not exist.')
  })

  test('Should fail -- User is not authenticated', async () => {
    const res = await request(app).delete(path + '/remove-one')
      .set({ Authorization: 'Bearer invalidtoken' })
      .send({ scheduleId: -1 })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid token.')
  })
})

/* --- NEEDS TO BE COMPLETED --- */
// INPUTS: user_id (from header), day
// carpooler is first user; driver is second user
describe('Testing matching carpooler with driver -- To campus', () => {
  test('Successfully return matches for to campus', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).get(path + `/match-to-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(`Successfully found matches for going to campus on ${carpoolerSchedule.day}.`)
    expect(res.body.drivers[0]).toEqual(
      {
        id: expect.any(Number),
        day: expect.any(String),
        flexibility_early: null,
        flexibility_late: null,
        to_campus: expect.any(String),
        from_campus: expect.any(String),
        user_id: expect.any(Number)
      }
    )
  })

  test('Should fail -- No matches found', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).get(path + `/match-to-campus?day=${days[4]}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    expect(res.status).toBe(404)
    expect(res.body.error).toBe(`No driver matches found for going to campus on ${days[4]}`)
  })

  test('Should fail -- Invalid or missing day', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).get(path + '/match-to-campus?day=invalidday')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Day is invalid or missing.')
  })

  test('Should fail -- User is not a carpooler', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...secondUser })

    const res = await request(app).get(path + `/match-to-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('User is not a carpooler. Only carpoolers are allowed to match with drivers.')
  })

  test('Should fail -- User is not authenticated', async () => {
    const res = await request(app).get(path + `/match-to-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: 'Bearer invalidtoken' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid token.')
  })
})

describe('Testing matching carpooler with driver -- From campus', () => {
  test('Successfully return matches for from campus', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).get(path + `/match-from-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(`Successfully found matches for going from campus on ${carpoolerSchedule.day}.`)
    expect(res.body.drivers[0]).toEqual(
      {
        id: expect.any(Number),
        day: expect.any(String),
        flexibility_early: null,
        flexibility_late: null,
        to_campus: expect.any(String),
        from_campus: expect.any(String),
        user_id: expect.any(Number)
      }
    )
  })

  test('Should fail -- No matches found', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })
    const day = 'Friday'

    const res = await request(app).get(path + `/match-from-campus?day=${day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    expect(res.status).toBe(404)
    expect(res.body.error).toBe(`No driver matches found for going from campus on ${day}`)
  })

  test('Should fail -- Invalid or missing day', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })

    const res = await request(app).get(path + '/match-from-campus?day=invalidday')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Day is invalid or missing.')
  })

  test('Should fail -- User is not a carpooler', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...secondUser })

    const res = await request(app).get(path + `/match-to-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('User is not a carpooler. Only carpoolers are allowed to match with drivers.')
  })

  test('Should fail -- User is not authenticated', async () => {
    const res = await request(app).get(path + `/match-from-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: 'Bearer invalidtoken' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid token.')
  })
})

// INPUTS: user_id, driver_id, driver_schedule_id
describe('Testing driver selection to campus', () => {
  test('Successfully choose a driver to campus', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })
    const matchRes = await request(app).get(path + `/match-to-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    const res = await request(app).post(path + '/driver-to-campus')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({
        driverId: matchRes.body.drivers[0].user_id,
        driverScheduleId: matchRes.body.drivers[0].id,
        day: matchRes.body.drivers[0].day
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(`Successfully set driver to campus for ${matchRes.body.drivers[0].day}`)
  })

  test('Should fail -- driver does not exist', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })
    const matchRes = await request(app).get(path + `/match-to-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    const res = await request(app).post(path + '/driver-to-campus')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({
        driverId: -1,
        driverScheduleId: matchRes.body.drivers[0].id,
        day: matchRes.body.drivers[0].day
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Driver with id: -1 does not exist.')
  })

  test('Should fail -- driver schedule does not exist', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })
    const matchRes = await request(app).get(path + `/match-to-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    const res = await request(app).post(path + '/driver-to-campus')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({
        driverId: matchRes.body.drivers[0].user_id,
        driverScheduleId: -1,
        day: matchRes.body.drivers[0].day
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Driver schedule with scheduleId: -1 does not exist.')
  })

  test('Should fail -- User is not authenticated', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })
    const matchRes = await request(app).get(path + `/match-to-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    const res = await request(app).post(path + '/driver-to-campus')
      .set({ Authorization: 'Bearer invalidtoken' })
      .send({
        driverId: matchRes.body.drivers[0].user_id,
        driverScheduleId: matchRes.body.drivers[0].id,
        day: matchRes.body.drivers[0].day
      })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid token.')
  })
})

// INPUTS: user_id, driver_id, driver_schedule_id
describe('Testing driver selection from campus', () => {
  test('Successfully choose a driver from campus', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })
    const matchRes = await request(app).get(path + `/match-from-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    const res = await request(app).post(path + '/driver-from-campus')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({
        driverId: matchRes.body.drivers[0].user_id,
        driverScheduleId: matchRes.body.drivers[0].id,
        day: matchRes.body.drivers[0].day
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(`Successfully set driver from campus for ${matchRes.body.drivers[0].day}`)
  })

  test('Should fail -- driver does not exist', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })
    const matchRes = await request(app).get(path + `/match-from-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    const res = await request(app).post(path + '/driver-from-campus')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({
        driverId: -1,
        driverScheduleId: matchRes.body.drivers[0].id,
        day: matchRes.body.drivers[0].day
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Driver with id: -1 does not exist.')
  })

  test('Should fail -- driver schedule does not exist', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })
    const matchRes = await request(app).get(path + `/match-from-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    const res = await request(app).post(path + '/driver-from-campus')
      .set({ Authorization: `Bearer ${loginRes.body.token}` })
      .send({
        driverId: matchRes.body.drivers[0].user_id,
        driverScheduleId: -1,
        day: matchRes.body.drivers[0].day
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Driver schedule with scheduleId: -1 does not exist.')
  })

  test('Should fail -- User is not authenticated', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })
    const matchRes = await request(app).get(path + `/match-from-campus?day=${carpoolerSchedule.day}`)
      .set({ Authorization: `Bearer ${loginRes.body.token}` })

    const res = await request(app).post(path + '/driver-from-campus')
      .set({ Authorization: 'Bearer invalidtoken' })
      .send({
        driverId: matchRes.body.drivers[0].user_id,
        driverScheduleId: matchRes.body.drivers[0].id,
        day: matchRes.body.drivers[0].day
      })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid token.')
  })
})
