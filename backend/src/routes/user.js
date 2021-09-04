const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = require('express').Router()

const pool = require('../connectdb')
const helpers = require('../helpers/helpers')

router.get('/', (req, res) => {
    res.send('User Home Page')
})

router.post('/registertest', async (req, res) => {
    console.log(req.body)
    res.send(req.body)
})

/* USER REGISTRATION */
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

            return res.status(201).send({ success: 'New user created.' })
        }
    )
})

/* USER LOGIN */
router.post('/login', (req, res) => {
    const { email, password } = req.body

    // 1. Find if user with email exists

    // In function
    // 1a. Check that users email is verified
    // 2. Verify the password; compare with bcrypt

    // 3. Return a jwt for session authentication if successful

    pool.query(`SELECT email, password, is_verified FROM users WHERE email=$1`, [email], (err, results) => {
        if (err) {
            return console.log(err)
        }

        if (results.rows.length === 0) {
            return res.status(404).send({ error: 'User not found.' })
        }

        const hashedPassword = results.rows[0].password
        const isVerified = results.rows[0].hashedPassword
        const userId = results.rows[0].id

        const { authenticated, status, message } = helpers.verifyUserLogin(password, hashedPassword, isVerified)

        if (!authenticated) {
            return res.status(status).send({ error: message })
        } else {
            const token = jwt.sign({ id: userId.toString() }, 'letscarpool', { expiresIn: '1 day' })
            pool.query(`INSERT INTO user_session_tokens(user_id, session_token) VALUES ($1, $2)`,
                [userId, token], (err, results) => {
                    if (err) {
                        return console.log(err)
                    }

                    return res.status(status).send({ success: message })       
                }
            )
        }
    })

})


module.exports = router