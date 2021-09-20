const pool = require('../connectdb')

let input = [{}] // array of objects

flex_early = 30
flex_late = 20

for (let i = 0; i < 5; i++) {
    // Checks for input

    pool.query(`INSERT INTO user_schedules(user_id, day, flexibility_early,
        flexibility_late, to_campus, from_campus, driver, group_id) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)`, [input[i]])

        /* NOTE: time datatype - int datatype
        earliestTime = to_campus - flex_early
        latestTime = to_campus + flex_late
        */ 
}

// Returns schedules for carpooler to match with drivers to campus
// for a given day
pool.query(`SELECT * FROM user_schedules WHERE group_id=$1 AND driver=$2
            AND day=$1 AND to_campus BETWEEN $2 AND $3`, [day, earliestTime, latesTime], (err, results) => {
    // results
})




// 1. Users enter schedules per day (5 days of week)
// 2. Query matches
//  a. Select driver schedules that are in same group as carpooler per day
// 3. Carpooler chooses drivers and driver_carpool_schdedules is filled accordingly

// ROUTES
// 1. Create a schedule
// 2. 
