const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser').json()

const userRouter = require('./routes/user')

app.use(cors());
app.use('/api/user', bodyParser, userRouter)

app.get('/', (req, res) => {
    res.send('Hello Carpool App!')
})

module.exports = app