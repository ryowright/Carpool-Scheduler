const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
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
    const { email, firstname, lastname, password, type, carspace, school } = req.body

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

    if (!school || !validator.isAlpha(school)) {
        return res.status(400).send({ error: 'Please enter/select a valid school.' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8)

    // Email verification --- Twilio


    pool.query(`INSERT INTO users(email, firstname, lastname, password, type, carspace, school)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`, [email, firstname, lastname, hashedPassword, type, carspace, school], 
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

/* USER LOGOUT */
router.post('/logout', (req, res) => {
    const { token } = req.body
    const decoded = jwt.verify(token, 'letscarpool')

    if (!token) {
        return res.status(400).send({ error: 'Token does not exist.' })
    }

    pool.query(`DELETE FROM user_session_tokens WHERE user_id=$1 AND session_token=$2`, [decoded.id, token], (err, results) => {
        if (err) {
            return console.log(err)
        }

        return res.status(200).send({ success: 'User logged out successfully.' })
    })
})

/* FORGOT/RESET PASSWORD EMAIL */
router.post('/reset-password-email', (req, res) => {
    const { email } = req.body
    let userId = ""

    // 1. Verify that email exists
    pool.query(`SELECT id, email FROM users WHERE email=$1`, [email], (err, results) => {
        if (err) {
            return console.log(err)
        }

        if (results.rows.length === 0) {
            return res.status(404).send({ error: 'Email address does not exist in our database.' })
        }

        userId = results.rows[0].id
        if (!userId) {
            return res.status(404).send({ error: 'Unable to find user Id.' })
        }
    })

    // 2. Generate reset token and insert into database
    const resetToken = crypto.randomBytes(64).toString('hex')

    pool.query(`INSERT INTO password_change_requests(user_id, reset_token) VALUES ($1, $2)`, [userId, resetToken], (err, results) => {
        if (err) {
            return console.log(err)
        }
    })

    // 3. Send email with link containing reset token -- twilio


})

/* FORGOT/RESET PASSWORD */
router.post('/reset-password', (req, res) => {
    const { resetToken, newPassword } = req.body

    // 1. Get entry for reset token in database
    pool.query(`SELECT * FROM password_change_requests WHERE reset_token=$1`, [resetToken], (err, results) => {
        if (err) {
            return console.log(err)
        }

        if (results.rows.length === 0) {
            return res.status(404).send({ error: 'Reset token does not exist in database.' })
        }

        const userId = results.rows[0].user_id
        const hashedPassword = await bcrypt.hash(newPassword, 8)
        
        // 2. Check that timestamp is no more than 24 hours apart
        

        // 3. Delete the reset token entry
        pool.query(`DELETE FROM password_change_requests WHERE reset_token=$1 AND user_id=$2`, [resetToken, userId], (err, results) => {
            if (err) {
                return console.log(err)
            }
        })

        // 4. Update password for user in database
        pool.query(`UPDATE users SET password=$1 WHERE id=$2`, [hashedPassword, userId], (err, results) => {
            if (err) {
                return console.log(err)
            }

            return res.status(200).send({ success: 'Your password has been successfully reset.' })
        })
    })
})

module.exports = router