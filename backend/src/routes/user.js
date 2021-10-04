const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const crypto = require('crypto')
const router = require('express').Router()
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const pool = require('../connectdb')
const helpers = require('../helpers/helpers')
const auth = require('../middleware/auth')

const hostURL = process.env.HOST_URL
const nodeEnv = process.env.NODE_ENV

/* USER REGISTRATION */
router.post('/register', async (req, res) => {
  const { email, firstname, lastname, password, driver, carspace, school } = req.body

  if (!req.body) {
    return res.status(400).send({ error: 'Please enter the required information.' })
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).send({ error: 'Email is not valid.' })
  }

  // Check that first and last name are in valid format
  if (!validator.isAlpha(firstname) || !validator.isAlpha(lastname)) {
    return res.status(400).send({ error: 'Name cannot contain numbers or symbols.' })
  }

  // Check password length
  if (!validator.isLength(password, { min: 6, max: 32 })) {
    return res.status(400).send({ error: 'Password must be between 6 to 32 characters in length.' })
  }

  // If driver is true, carspace cannot be empty
  if (driver === true && !carspace) {
    return res.status(400).send({ error: 'Drivers must enter a carspace (number of members that can fit in car excluding the driver) value.' })
  }

  // If driver is false, carspace must be empty
  if (driver === false && !!carspace) {
    return res.status(400).send({ error: 'Carpoolers cannot enter a carspace value.' })
  }

  if (!school || !validator.isAlpha(validator.blacklist(school, ' ,-'))) {
    return res.status(400).send({ error: 'Please enter/select a valid school.' })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 8)

  // Email verification --- Twilio
  // const emailToken = crypto.randomBytes(64).toString('hex')
  const emailToken = Math.random().toString().slice(2, 10)
  if (nodeEnv !== 'TEST') {
    console.log('send verify email')
    helpers.sendVerifyEmail(email, firstname, emailToken, hostURL)
  }

  // Check for duplicate email
  pool.query('SELECT * FROM users WHERE email=$1', [email], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length > 0) {
      return res.status(400).send({ error: 'Email already in use.' })
    }

    pool.query(`INSERT INTO users(email, firstname, lastname, password, driver, carspace, school, email_token)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [email, firstname, lastname, hashedPassword, driver, carspace, school, emailToken],
    (err, results) => {
      if (err) {
        console.log({ err })
        return res.status(500).send({ error: err })
      }

      return res.status(201).send({ success: 'Registration successful.' })
    })
  })
})

/* RESEND VERIFICATION EMAIL */
router.post('/resend-verify-email', (req, res) => {
  const { email } = req.body
  const emailToken = Math.random().toString().slice(2, 10)

  pool.query('UPDATE users SET email_token=$1 WHERE email=$2 RETURNING firstname', [emailToken, email], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length === 0) {
      return res.status(400).send({ error: 'Email not found.' })
    }

    const firstname = results.rows[0].firstname
    helpers.sendVerifyEmail(email, firstname, emailToken, hostURL)

    return res.status(200).send({ success: 'Verification email successfully sent.' })
  })
})

/* VERIFY EMAIL */
router.post('/verify-email', (req, res) => {
  const { emailToken } = req.body

  if (!emailToken) {
    return res.status(400).send({ error: 'No email token provided.' })
  }

  pool.query('SELECT id, email FROM users WHERE email_token=$1', [emailToken], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length === 0) {
      return res.status(404).send({ error: 'User not found. Invalid email token.' })
    }

    pool.query("UPDATE users SET email_token=null, is_verified='true' WHERE email_token=$1", [emailToken], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      return res.status(200).send({ success: 'User successfully verified.' })
    })
  })
})

/* USER LOGIN */
router.post('/login', (req, res) => {
  const { email, password } = req.body

  // 1. Find if user with email exists

  // In function
  // 1a. Check that users email is verified
  // 2. Verify the password; compare with bcrypt

  // 3. Return a jwt for session authentication if successful

  pool.query('SELECT id, password, is_verified FROM users WHERE email=$1', [email], async (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length === 0) {
      return res.status(404).send({ error: 'Incorrect credentials.' })
    }

    const hashedPassword = results.rows[0].password
    const isVerified = results.rows[0].is_verified
    const userId = results.rows[0].id

    const object = await helpers.verifyUserLogin(password, hashedPassword, isVerified)

    if (!object.authenticated) {
      return res.status(object.status).send({ error: object.message })
    } else {
      if (!isVerified) {
        return res.status(401).send({ error: 'User is not verified.', isVerified })
      }
      const token = jwt.sign({ id: userId.toString() }, 'letscarpool', { expiresIn: '1 day' })
      pool.query('INSERT INTO user_session_tokens(user_id, session_token) VALUES ($1, $2)',
        [userId, token], (err, results) => {
          if (err) {
            return res.status(500).send({ error: err })
          }

          return res.status(object.status).send({ success: object.message, token })
        }
      )
    }
  })
})

/* USER LOGOUT */
router.post('/logout', auth, (req, res) => {
  if (!req.token) {
    return res.status(401).send({ error: 'Invalid token.' })
  }

  pool.query('DELETE FROM user_session_tokens WHERE user_id=$1 AND session_token=$2', [req.userId, req.token], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    return res.status(200).send({ success: 'User logged out successfully.' })
  })
})

/* FORGOT/RESET PASSWORD EMAIL */
router.post('/reset-password-email', (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).send({ error: 'Please enter an email.' })
  }

  // 1. Verify that email exists
  pool.query('SELECT id, email, firstname FROM users WHERE email=$1', [email], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length === 0) {
      return res.status(404).send({ error: 'No account associated with this email address.' })
    }

    const userId = results.rows[0].id
    const firstname = results.rows[0].firstname
    if (!userId) {
      return res.status(404).send({ error: 'Unable to find user Id.' })
    }

    // 2. Generate reset token and insert into database
    const resetToken = Math.random().toString().slice(2, 10)

    pool.query('INSERT INTO password_change_requests(user_id, reset_token) VALUES ($1, $2)', [userId, resetToken], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }
    })

    // 3. Send email with link containing reset token -- twilio
    if (nodeEnv !== 'TEST') {
      helpers.sendPasswordResetEmail(email, firstname, resetToken, hostURL)
    }

    return res.status(200).send({ success: 'Reset email successfully sent.' })
  })
})

/* FORGOT/RESET PASSWORD */
router.post('/reset-password-code', (req, res) => {
  const { resetToken } = req.body

  // 1. Get entry for reset token in database
  pool.query('SELECT * FROM password_change_requests WHERE reset_token=$1', [resetToken], async (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length === 0) {
      return res.status(404).send({ error: 'Invalid reset code.' })
    }

    const userId = results.rows[0].user_id

    // 2. Check that timestamp is no more than 24 hours apart
    const createdDate = new Date(results.rows[0].created_at)
    const currentDate = new Date()

    const hoursDiff = Math.abs(currentDate.getTime() - createdDate.getTime()) / 36e5

    if (hoursDiff > 24) {
      pool.query('DELETE FROM password_change_requests WHERE reset_token=$1 AND user_id=$2', [resetToken, userId], (err, results) => {
        if (err) {
          return res.status(500).send({ error: err })
        }

        return res.status(400).send({ error: 'Reset code has expired. Resend reset password email.' })
      })
      return
    }

    return res.status(200).send({ success: 'Code successfully confirmed.', userId, resetToken })
  })
})

router.post('/reset-password', async (req, res) => {
  const { newPassword, userId, resetToken } = req.body
  const hashedPassword = await bcrypt.hash(newPassword, 8)

  if (!validator.isLength(newPassword, { min: 6, max: 32 })) {
    return res.status(400).send({ error: 'Password must be between 6 to 32 characters in length.' })
  }

  // 3. Delete the reset token entry
  pool.query('DELETE FROM password_change_requests WHERE reset_token=$1 AND user_id=$2 RETURNING user_id', [resetToken, userId], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length === 0) {
      return res.status(400).send({ error: 'Invalid user id or invalid/expired reset code.' })
    }

    // 4. Update password for user in database
    pool.query('UPDATE users SET password=$1 WHERE id=$2', [hashedPassword, userId], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      return res.status(200).send({ success: 'Your password has been successfully reset.' })
    })
  })
})

router.get('/me', auth, (req, res) => {
  if (!req.token || !req.userId) {
    return res.status(401).send({ error: 'User is unauthenticated.' })
  }
  
  pool.query(`SELECT email, firstname, lastname, driver, carspace, school, group_id, admin
  FROM users WHERE id=$1`, [req.userId], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    const user = results.rows[0]

    return res.status(200).send({ success: 'Successfully retrieved user info.', user })
  })
})

module.exports = router
