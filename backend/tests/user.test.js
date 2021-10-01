const request = require('supertest')
const pool = require('../src/connectdb')
const app = require('../src/app')
const bcrypt = require('bcrypt')

const user = {
  email: 'ryow.college@gmail.com',
  firstname: 'Ryo',
  lastname: 'Wright',
  password: 'testpassword',
  driver: false,
  school: 'University of California, Merced',
  isVerified: true,
  resetToken: ''
}

const regUser = {
  email: 'ryogwright@gmail.com',
  firstname: 'Ryo',
  lastname: 'Wright',
  password: 'testpassword',
  driver: false,
  school: 'University of California, Merced',
  carspace: null
}

const loginPath = '/api/user/login'
const logoutPath = '/api/user/logout'
const registerPath = '/api/user/register'

beforeAll(async () => {
  await pool.query('DELETE FROM user_session_tokens')
  await pool.query('DELETE FROM password_change_requests')
  await pool.query('DELETE FROM users')
})

afterEach(async () => {
  await pool.query('DELETE FROM user_session_tokens')
  await pool.query('DELETE FROM password_change_requests')
  await pool.query('DELETE FROM users')
})

afterAll(() => {
  pool.end()
})

describe('Testing Login -- Credentials', () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(user.password, 8)

    await pool.query(`INSERT INTO users(email, firstname, lastname, password, driver, school, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user.email, user.firstname, user.lastname, hashedPassword, user.driver, user.school, user.isVerified])
  })

  test('Should login successsfully', async () => {
    const res = await request(app).post(loginPath).send({ ...user })
    expect(res.status).toEqual(200)
    expect(res.body.success).toEqual('Login successful.')
  })

  test('Login should fail -- Incorrect email', async () => {
    const res = await request(app).post(loginPath).send({ ...user, email: 'testemail@gmail.com' })
    expect(res.status).toEqual(404)
    expect(res.body.error).toEqual('Incorrect credentials.')
  })

  test('Login should fail -- Incorrect password', async () => {
    const res = await request(app).post(loginPath).send({ ...user, password: 'wrongpassword' })
    expect(res.status).toEqual(401)
    expect(res.body.error).toEqual('Incorrect credentials.')
  })
})

describe('Testing Login -- Other', () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(user.password, 8)

    await pool.query(`INSERT INTO users(email, firstname, lastname, password, driver, school, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user.email, user.firstname, user.lastname, hashedPassword, user.driver, user.school, false])
  })

  test('Login should fail -- Unverified user', async () => {
    const res = await request(app).post(loginPath).send({ ...user })
    expect(res.status).toEqual(401)
    expect(res.body.error).toEqual('User is not verified.')
  })
})

describe('Testing Logout', () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(user.password, 8)

    await pool.query(`INSERT INTO users(email, firstname, lastname, password, driver, school, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user.email, user.firstname, user.lastname, hashedPassword, user.driver, user.school, user.isVerified])
  })

  test('Should logout successfully', async () => {
    const loginRes = await request(app).post(loginPath).send({ ...user })
    const res = await request(app).post(logoutPath).set({ Authorization: `Bearer ${loginRes.body.token}` })
    expect(res.status).toEqual(200)
    expect(res.body.success).toEqual('User logged out successfully.')
  })

  test('Logout should fail -- No token provided', async () => {
    const res = await request(app).post(logoutPath).set({ Authorization: 'Bearer wrongtoken' })
    expect(res.status).toEqual(401)
    expect(res.body.error).toEqual('Invalid token.')
    // fails in auth middleware function
  })
})

describe('Testing Registration', () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(user.password, 8)

    await pool.query(`INSERT INTO users(email, firstname, lastname, password, driver, school, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user.email, user.firstname, user.lastname, hashedPassword, user.driver, user.school, user.isVerified])
  })

  test('Should register successfully', async () => {
    const res = await request(app).post(registerPath).send({ ...regUser })
    expect(res.status).toEqual(201)
    expect(res.body.success).toEqual('Registration successful.')
  })

  test('Registration should fail -- Invalid email format', async () => {
    const res = await request(app).post(registerPath).send({ ...regUser, email: 'wrongemail@123' })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Email is not valid.')
  })

  test('Registration should fail -- Duplicate email', async () => {
    const res = await request(app).post(registerPath).send({ ...regUser, email: user.email })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Email already in use.')
  })

  test('Registration should fail -- Invalid first name', async () => {
    const res = await request(app).post(registerPath).send({ ...regUser, firstname: 'Ryo123' })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Name cannot contain numbers or symbols.')
  })

  test('Registration should fail -- Invalid last name', async () => {
    const res = await request(app).post(registerPath).send({ ...regUser, lastname: 'Wright&%' })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Name cannot contain numbers or symbols.')
  })

  test('Registration should fail -- Password is too short', async () => {
    const res = await request(app).post(registerPath).send({ ...regUser, password: 'pass' })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Password must be between 6 to 32 characters in length.')
  })

  test('Registration should fail -- Password is too long', async () => {
    const res = await request(app).post(registerPath).send({ ...regUser, password: 'thispasswordiswaytoolongbecauseitexceedsthemaxlimitof32characters' })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Password must be between 6 to 32 characters in length.')
  })

  test('Registration should fail -- driver is true without carspace value', async () => {
    const res = await request(app).post(registerPath).send({ ...regUser, driver: true })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Drivers must enter a carspace (number of members that can fit in car excluding the driver) value.')
  })

  test('Registration should fail -- driver is false with carspace value', async () => {
    const res = await request(app).post(registerPath).send({ ...regUser, carspace: 4 })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Carpoolers cannot enter a carspace value.')
  })

  test('Registration should fail -- Invalid school', async () => {
    const res = await request(app).post(registerPath).send({ ...regUser, school: 'UCM 23' })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Please enter/select a valid school.')
  })
})

describe('Testing Email Verification', () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(user.password, 8)

    await pool.query(`INSERT INTO users(email, firstname, lastname, password, driver, school, email_token)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user.email, user.firstname, user.lastname, hashedPassword, user.driver, user.school, 'testemailtoken'])
  })

  test('Successfully verify email', async () => {
    const res = await request(app).post('/api/user/verify-email').send({ emailToken: 'testemailtoken' })
    expect(res.status).toEqual(200)
    expect(res.body.success).toEqual('User successfully verified.')
  })

  test('Email verification should fail -- No email token supplied', async () => {
    const res = await request(app).post('/api/user/verify-email').send({ emailToken: '' })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('No email token provided.')
  })

  test('Email verification should fail -- Email token does not exist', async () => {
    const res = await request(app).post('/api/user/verify-email').send({ emailToken: 'invalidtoken' })
    expect(res.status).toEqual(404)
    expect(res.body.error).toEqual('User not found. Invalid email token.')
  })
})

describe('Testing Forgot/Reset Password Email', () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(user.password, 8)

    await pool.query(`INSERT INTO users(email, firstname, lastname, password, driver, school, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user.email, user.firstname, user.lastname, hashedPassword, user.driver, user.school, user.isVerified])
  })

  test('Successfully send Forgot/Reset password email', async () => {
    const res = await request(app).post('/api/user/reset-password-email').send({ email: 'ryow.college@gmail.com' })
    expect(res.status).toEqual(200)
    expect(res.body.success).toEqual('Reset email successfully sent.')
  })

  test('Forgot/Reset password email should fail -- No email supplied', async () => {
    const res = await request(app).post('/api/user/reset-password-email').send({ email: '' })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Please enter an email.')
  })

  test('Forgot/Reset password email should fail -- Email does not exist', async () => {
    const res = await request(app).post('/api/user/reset-password-email').send({ email: 'nonexistent@gmail.com' })
    expect(res.status).toEqual(404)
    expect(res.body.error).toEqual('No account associated with this email address.')
  })
})

describe('Testing Forgot/Reset Password Code', () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(user.password, 8)

    await pool.query(`INSERT INTO users(email, firstname, lastname, password, driver, school, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user.email, user.firstname, user.lastname, hashedPassword, user.driver, user.school, user.isVerified])

    pool.query('SELECT id, email, firstname FROM users WHERE email=$1', [user.email], (err, results) => {
      if (err) {
        return console.error(err)
      }

      if (results.rows.length === 0) {
        return console.error('No account associated with this email.')
      }

      const userId = results.rows[0].id

      if (!userId) {
        return console.error('Unable to find user ID.')
      }

      // 2. Generate reset token and insert into database
      const resetToken = '12345678'

      pool.query('INSERT INTO password_change_requests(user_id, reset_token) VALUES ($1, $2)', [userId, resetToken], (err, results) => {
        if (err) {
          return console.error(err)
        }
      })
    })
  })

  test('Successfully confirm reset code', async () => {
    const res = await request(app).post('/api/user/reset-password-code').send({ resetToken: '12345678' })
    expect(res.status).toEqual(200)
    expect(res.body.success).toEqual('Code successfully confirmed.')
  })

  test('Forgot/Reset password code should fail -- Invalid code', async () => {
    const res = await request(app).post('/api/user/reset-password-code').send({ resetToken: 'invalidtoken' })
    expect(res.status).toEqual(404)
    expect(res.body.error).toEqual('Invalid reset code.')
  })

  // Test password reset request expiration
  test('Forgot/Reset password should fail -- Request has expired (24 hours)', async () => {
    pool.query('SELECT id FROM users WHERE email=$1', [user.email], async (err, results) => {
      if (err) {
        throw new Error(err)
      }
      const userId = results.rows[0].id
      const createdAt = new Date('December 25, 2020 12:00:00')
      await pool.query('UPDATE password_change_requests SET created_at=$1 WHERE user_id=$2', [createdAt, userId])
    })

    const res = await request(app).post('/api/user/reset-password-code').send({ resetToken: '12345678' })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Reset code has expired. Resend reset password email.')
  })
})

describe('Testing Password Reset', () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(user.password, 8)

    await pool.query(`INSERT INTO users(email, firstname, lastname, password, driver, school, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [user.email, user.firstname, user.lastname, hashedPassword, user.driver, user.school, user.isVerified])

    pool.query('SELECT id, email, firstname FROM users WHERE email=$1', [user.email], (err, results) => {
      if (err) {
        return console.error(err)
      }

      if (results.rows.length === 0) {
        return console.error('No account associated with this email.')
      }

      const userId = results.rows[0].id

      if (!userId) {
        return console.error('Unable to find user ID.')
      }

      // 2. Generate reset token and insert into database
      const resetToken = '12345678'

      pool.query('INSERT INTO password_change_requests(user_id, reset_token) VALUES ($1, $2)', [userId, resetToken], (err, results) => {
        if (err) {
          return console.error(err)
        }
      })
    })
  })

  test('Successfully reset password', async () => {
    const codeRes = await request(app).post('/api/user/reset-password-code').send({ resetToken: '12345678' })
    const res = await request(app).post('/api/user/reset-password').send({
      newPassword: 'newpassword',
      userId: codeRes.body.userId,
      resetToken: codeRes.body.resetToken
    })
    expect(res.status).toEqual(200)
    expect(res.body.success).toEqual('Your password has been successfully reset.')
  })

  test('Reset password should fail -- Password is too short', async () => {
    const res = await request(app).post('/api/user/reset-password').send({ newPassword: 'pass' })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Password must be between 6 to 32 characters in length.')
  })

  test('Reset password should fail -- Password is too long', async () => {
    const res = await request(app).post('/api/user/reset-password').send({ newPassword: 'thispasswordiswaytoolongbecauseitexceedsthemaxlimitof32characters' })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Password must be between 6 to 32 characters in length.')
  })

  test('Reset password should fail -- invalid user id.', async () => {
    const codeRes = await request(app).post('/api/user/reset-password-code').send({ resetToken: '12345678' })
    const res = await request(app).post('/api/user/reset-password').send({
      newPassword: 'newpassword',
      userId: -20,
      resetToken: codeRes.body.resetToken
    })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Invalid user id or invalid/expired reset code.')
  })

  test('Reset password should fail -- invalid reset code', async () => {
    const codeRes = await request(app).post('/api/user/reset-password-code').send({ resetToken: '12345678' })
    const res = await request(app).post('/api/user/reset-password').send({
      newPassword: 'newpassword',
      userId: codeRes.body.userId,
      resetToken: '24'
    })
    expect(res.status).toEqual(400)
    expect(res.body.error).toEqual('Invalid user id or invalid/expired reset code.')
  })
})
