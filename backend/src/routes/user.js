const validator = require('validator')
const bcrypt = require('bcrypt')
const router = require('express').Router()
const pool = require('../connectdb')

router.get('/', (req, res) => {
    res.send('User Home Page')
})

router.post('/registertest', async (req, res) => {
    console.log(req.body)
    res.send(req.body)
})

router.post('/register', async (req, res) => {
    const { email, firstname, lastname, password, type, carspace } = req.body

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.status(400).send({ error: 'Email is not valid.' })
    }

    // Check for duplicate email
    pool.query(`SELECT * FROM users WHERE email=$1`, [email], (err, results) => {
        if (err) {
            return console.log(err)
        }

        if (results.rows.length > 0) {
            return res.status(400).send({ error: 'Email already in use.' })
        }
    })

    // Check that first and last name are in valid format
    if (!validator.isAlpha(firstname) || !validator.isAlpha(lastname)) {
        return res.status(400).send({ error: 'Name cannot contain numbers or symbols.' })
    }

    // Check password length
    if (!validator.isLength(password, { min: 6, max: 32 })) {
        return res.status(400).send({ error: 'Password must be between 6 to 32 characters in length.' })
    }

    // Check that type is either 'driver' or 'carpooler'
    if (type !== 'driver' && type !== 'carpooler') {
        return res.status(400).send({ error: 'Invalid type (must be \'driver\' or \'carpooler\').' })
    }

    // If type is 'driver', carspace cannot be empty
    if (type === 'driver' && !carspace) {
        return res.status(400).send({ error: 'Drivers must enter a carspace (number of members that can fit in car) value.' })
    }

    // If type is 'carpooler', carspace must be empty
    if (type === 'carpooler' && !!carspace) {
        return res.status(400).send({ error: 'Carpoolers cannot enter a carspace value.' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8)

    // Email verification --- Twilio


    pool.query(`INSERT INTO users(email, firstname, lastname, password, type, carspace)
        VALUES ($1, $2, $3, $4, $5, $6)`, [email, firstname, lastname, hashedPassword, type, carspace], 
        (err, results) => {
            if (err) {
                return console.log(err)
            }

            res.status(201).send({ success: 'New user created.' })
        }
    )
})

module.exports = router