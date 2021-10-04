const moment = require('moment')
const monday = new Date()
console.log({monday})

const time = '16:30:00'
const secondTime = '09:30:00'
const newTime = moment(time, 'HH:mm:ss')
const secondNewTime = moment(secondTime, 'HH:mm:ss')

console.log(newTime.isBefore(secondNewTime))

// monday.setTime(newTime)
// console.log({newMonday: monday})

// console.log(newTime.toLocaleString())
// console.log(monday.toLocaleTimeString())