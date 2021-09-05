const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser').json()
const port = 3000;

const userRouter = require('./routes/user')

app.use(cors());
app.use('/api/user', bodyParser, userRouter)

app.get('/', (req, res) => {
    res.send('Hello Carpool App!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})