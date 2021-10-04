const router = require('express').Router()
const moment = require('moment')

const pool = require('../connectdb')
const auth = require('../middleware/auth')

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

/* CREATE A SCHEDULE FOR A GIVEN DAY */
router.post('/create', auth, (req, res) => {
  const { day, flexibilityEarly, flexibilityLate, toCampus, fromCampus } = req.body

  // DRIVERS CANNOT SET FLEXIBILITY TIMES

  const toCampusTime = new Date(toCampus)
  const fromCampusTime = new Date(fromCampus)

  if (!req.userId || !req.token) {
    return res.status(401).send({ error: 'User is not authenticated.' })
  }

  if (!days.includes(day)) {
    return res.status(400).send({ error: 'Invalid value set for day.' })
  }

  if (toCampusTime.getTime() > fromCampusTime.getTime()) {
    return res.status(400).send({ error: 'to_campus time should not be later than from_campus time.' })
  }

  if (flexibilityEarly > 180 || flexibilityLate > 180) { // 180 minutes => 3 hours
    return res.status(400).send({ error: 'Flexibility time(s) should not be greater than 3 hours.' })
  }

  pool.query('SELECT id FROM user_daily_schedules WHERE user_id=$1 AND day=$2', [req.userId, day], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length > 0) {
      return res.status(400).send({ error: `Schedule already exists for ${day}` })
    }

    pool.query(`INSERT INTO user_daily_schedules(user_id, day, flexibility_early, flexibility_late, to_campus, from_campus)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [req.userId, day, flexibilityEarly, flexibilityLate,
      toCampusTime.toLocaleTimeString(), fromCampusTime.toLocaleTimeString()], (err, resultsOne) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      return res.status(200).send({ success: `Successfully set schedule for ${day}`, schedule: resultsOne.rows[0] })
    })
  })
})

/* GET A SCHEDULE FOR A GIVEN DAY */
router.get('/get-one', auth, (req, res) => {
  const { day } = req.query

  if (!day || !days.includes(day)) {
    return res.status(400).send({ error: 'Value for query field \'day\' is invalid or missing.' })
  }

  pool.query('SELECT * FROM user_daily_schedules WHERE user_id=$1 AND day=$2', [req.userId, day],
  (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    return res.status(200).send({ success: `Successfully retrieved user\'s schedule for ${day}`, schedule: results.rows[0] })
  })
})

/* GET ALL DAILY SCHEDULES FOR A USER */
router.get('/get-all', auth, (req, res) => {
  pool.query('SELECT * FROM user_daily_schedules WHERE user_id=$1', [req.userId], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    return res.status(200).send({ success: 'Successfully retrieved all of user\'s daily schedules.', schedules: results.rows })
  })
})

/* UPDATE A SCHEDULE FOR A GIVEN DAY -- NEEDS TO BE COMPLETED, NEEDS TO RETURN DRIVERS */
router.patch('/update-one', auth, (req, res) => {
  const { day, flexibilityEarly, flexibilityLate, toCampus, fromCampus } = req.body

  // DRIVERS CANNOT SET FLEXIBLITY TIMES

  const toCampusTime = new Date(toCampus)
  const fromCampusTime = new Date(fromCampus)

  if (!req.userId || !req.token) {
    return res.status(401).send({ error: 'User is not authenticated.' })
  }

  if (!days.includes(day)) {
    return res.status(400).send({ error: 'Value for query field \'day\' is invalid.' })
  }

  if (toCampusTime.getTime() > fromCampusTime.getTime()) {
    return res.status(400).send({ error: 'to_campus time should not be later than from_campus time.' })
  }

  if (flexibilityEarly > 180 || flexibilityLate > 180) { // 180 minutes => 3 hours
    return res.status(400).send({ error: 'Flexibility time(s) should not be greater than 3 hours.' })
  }

  pool.query(`UPDATE user_daily_schedules SET flexibility_early=$1, flexibility_late=$2, to_campus=$3, from_campus=$4
  WHERE user_id=$5 AND day=$6 RETURNING user_daily_schedules.*`, [flexibilityEarly, flexibilityLate, toCampusTime.toLocaleTimeString(), 
    fromCampusTime.toLocaleTimeString(), req.userId, day], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    return res.status(200).send({ success: `Successfully updated user\'s daily schedule for ${day}`, schedule: results.rows[0] })
  })

})

/* DELETE A SCHEDULE FOR A GIVEN DAY */
router.delete('/remove-one', auth, (req, res) => {
  const { scheduleId } = req.body

  pool.query('DELETE FROM user_daily_schedules WHERE id=$1 AND user_id=$2 RETURNING day', [scheduleId, req.userId], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length === 0) {
      return res.status(400).send({ error: 'Daily schedule does not exist.' })
    }

    return res.status(200).send({ success: `Successfully deleted user\'s daily schedule for ${results.rows[0].day}` })
  })
})

/* MATCH CARPOOLERS WITH DRIVERS */
router.get('/match-to-campus', auth, (req, res) => {
  const { day } = req.query

  if (!day || !days.includes(day)) {
    return res.status(400).send({ error: 'Day is invalid or missing.' })
  }

  // Gets all driver schedules for requested day
  // where count of driver_carpooler_schedule ids <= driver carspace
  pool.query(`SELECT * FROM user_daily_schedules WHERE user_id!=$1 AND day=$2 AND user_id IN (
    SELECT id FROM users WHERE driver=$3)`, [req.userId, day, true], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      // Get current user's schedule for requested day
      pool.query(`SELECT * FROM user_daily_schedules WHERE user_id=$1 AND day=$2`, [req.userId, day], (err, resultsTwo) => {
        if (err) {
          return res.status(500).send({ error: err })
        }

        if (resultsTwo.rows.length === 0) {
          return res.status(404).send({ error: `No driver matches found for going to campus on ${day}` })
        }

        // Gets drivers with to campus times within carpooler's
        // to campus time and early flex time
        const flexibilityEarly = resultsTwo.rows[0].flexibility_early
        const time = moment(resultsTwo.rows[0].to_campus, 'HH:mm:ss')
        const flexTime = moment(resultsTwo.rows[0].to_campus, 'HH:mm:ss').subtract(flexibilityEarly, 'm')

        const filteredDriversSchedules = results.rows.filter(driver => {
          const toCampusDriver = moment(driver.to_campus, 'HH:mm:ss')
          return toCampusDriver.isSameOrBefore(time) && toCampusDriver.isSameOrAfter(flexTime)
        })

        if (filteredDriversSchedules.length === 0) {
          return res.status(404).send({ error: `No driver matches found for going to campus on ${day}` })
        }

        const filteredDriversScheduleIds = []
        filteredDriversSchedules.forEach(driver => {
          filteredDriversScheduleIds.push(driver.id)
        })

        pool.query(`SELECT COUNT(*), driver_schedule_id, driver_id, carspace FROM driver_carpool_schedules 
          INNER JOIN users ON users.id=driver_id GROUP BY driver_schedule_id, driver_id, carspace`,
          [], (err, resultsThree) => {
            if (err) {
              console.error(err)
            }

            // Means that there are no paired drivers and carpoolers yet
            // send filteredDrivers as drivers in res.body
            if (resultsThree.rows.length === 0) {
              return res.status(200).send({ success: `Successfully found matches for going to campus on ${day}.`, drivers: filteredDriversSchedules })
            }

            // Filter out all drivers with no carspace left
            const carspaceFiltered = resultsThree.rows.filter(row => {
              return row.count < row.carspace
            })

            // FINAL COMPATIBLE LIST OF DRIVER SCHEDULE IDS
            const finalScheduleIds = carspaceFiltered.filter(row => filteredDriversScheduleIds.includes(row.driver_schedule_id))
            const finalSchedules = []
            filteredDriversSchedules.forEach(schedule => {
              if (finalScheduleIds.includes(schedule.id)) {
                finalSchedules.push(schedule)
              }
            })
            return res.status(200).send({ success: `Successfully found matches for going to campus on ${day}.`, drivers: finalSchedules })
          })
      })

      // Filter driver schedules based on:
      // flexibility early (user_daily_schedules) -- DONE
      // available carspace (users) -- DONE
      // and to campus time (user_daily_schedules) -- DONE

    })
})

/*  */
router.get('/match-from-campus', auth, (req, res) => {
  const { day } = req.query

  if (!day || !days.includes(day)) {
    return res.status(400).send({ error: 'Day is invalid or missing.' })
  }

  // Gets all driver schedules for requested day
  // where count of driver_carpooler_schedule ids <= driver carspace
  pool.query(`SELECT * FROM user_daily_schedules WHERE user_id!=$1 AND day=$2 AND user_id IN (
    SELECT id FROM users WHERE driver=$3)`, [req.userId, day, true], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      // Get current user's schedule for requested day
      pool.query(`SELECT * FROM user_daily_schedules WHERE user_id=$1 AND day=$2`, [req.userId, day], (err, resultsTwo) => {
        if (err) {
          return res.status(500).send({ error: err })
        }

        if (resultsTwo.rows.length === 0) {
          return res.status(404).send({ error: `No driver matches found for going from campus on ${day}` })
        }

        // Gets drivers with to campus times within carpooler's
        // to campus time and early flex time
        const flexibilityLate = resultsTwo.rows[0].flexibility_late
        const time = moment(resultsTwo.rows[0].from_campus, 'HH:mm:ss')
        const flexTime = moment(resultsTwo.rows[0].from_campus, 'HH:mm:ss').add(flexibilityLate, 'm')

        const filteredDriversSchedules = results.rows.filter(driver => {
          const toCampusDriver = moment(driver.from_campus, 'HH:mm:ss')
          return toCampusDriver.isSameOrBefore(flexTime) && toCampusDriver.isSameOrAfter(time)
        })

        if (filteredDriversSchedules.length === 0) {
          return res.status(404).send({ error: `No driver matches found for going from campus on ${day}` })
        }

        const filteredDriversScheduleIds = []
        filteredDriversSchedules.forEach(driver => {
          filteredDriversScheduleIds.push(driver.id)
        })

        pool.query(`SELECT COUNT(*), driver_schedule_id, driver_id, carspace FROM driver_carpool_schedules 
          INNER JOIN users ON users.id=driver_id GROUP BY driver_schedule_id, driver_id, carspace`,
          [], (err, resultsThree) => {
            if (err) {
              console.error(err)
            }

            // Means that there are no paired drivers and carpoolers yet
            // send filteredDrivers as drivers in res.body
            if (resultsThree.rows.length === 0) {
              return res.status(200).send({ success: `Successfully found matches for going from campus on ${day}.`, drivers: filteredDriversSchedules })
            }

            // Filter out all drivers with no carspace left
            const carspaceFiltered = resultsThree.rows.filter(row => {
              return row.count < row.carspace
            })

            // FINAL COMPATIBLE LIST OF DRIVER SCHEDULE IDS
            const finalScheduleIds = carspaceFiltered.filter(row => filteredDriversScheduleIds.includes(row.driver_schedule_id))
            const finalSchedules = []
            filteredDriversSchedules.forEach(schedule => {
              if (finalScheduleIds.includes(schedule.id)) {
                finalSchedules.push(schedule)
              }
            })
            return res.status(200).send({ success: `Successfully found matches for going from campus on ${day}.`, drivers: finalSchedules })
          })
      })

      // Filter driver schedules based on:
      // flexibility early (user_daily_schedules) -- DONE
      // available carspace (users) -- DONE
      // and to campus time (user_daily_schedules) -- DONE

    })
})

/*  */

/*  */

module.exports = router
