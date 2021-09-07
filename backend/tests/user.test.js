const request = require('supertest')
const pool = require('../src/connectdb')
const app = require('../src/app')
const bcrypt = require('bcrypt')

let user = {
    email: "ryow.college@gmail.com",
    firstname: "Ryo",
    lastname: "Wright",
    password: "testpassword",
    type: "carpooler",
    school: "University of California, Merced",
    isVerified: true
}

const loginPath = '/api/user/login'
const logoutPath = '/api/user/logout'
const registerPath = '/api/user/register'

beforeAll(async () => {
    await pool.query(`DELETE FROM user_session_tokens`)
    await pool.query(`DELETE FROM users`)
})

beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(user.password, 8)

    await pool.query(`INSERT INTO users(email, firstname, lastname, password, type, school, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.email, user.firstname, user.lastname, hashedPassword, user.type, user.school, user.isVerified])
})

afterEach(async () => {
    await pool.query(`DELETE FROM user_session_tokens`)
    await pool.query(`DELETE FROM users`)
})

afterAll(() => {
    pool.end()
})

describe('Login', () => {
    test('Should login successsfully', async () => {
        const res = await request(app).post(loginPath).send({...user})
        expect(res.status).toEqual(200)
    })

    test('Login should fail -- Incorrect email', async () => {
        await request(app).post(loginPath).send({...user, email: 'testemail@gmail.com'})
            .then((res) => {
                expect(res.status).toEqual(404)
                expect(res.body.error).toEqual('User not found.')
            })
    })
})