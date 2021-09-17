const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser').json()
app.use(cors());

const userRouter = require('./routes/user')
const groupRouter = require('./routes/group')

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/api/user', bodyParser, userRouter)
app.use('/api/group', bodyParser, groupRouter)

app.get('/', (req, res) => {
    res.send('Hello Carpool App!')
})

module.exports = app