const request = require('supertest')
const pool = require('../src/connectdb')
const app = require('../src/app')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const loginPath = '/api/user/login'
const createPath = '/api/group/create'
const getPath = '/api/group/me'
const searchPath = '/api/group/search'
const joinReqPath = '/api/group/join-request'
const joinTokenPath = '/api/group/join-token'
const changeAdminPath = '/api/group/admin'

const group = {
    groupName: "testgroup",
    description: "test description",
    privacy: "locked"
}

let user = {
    email: "ryow.college@gmail.com",
    firstname: "Ryo",
    lastname: "Wright",
    password: "testpassword",
    type: "carpooler",
    school: "University of California, Merced",
    isVerified: true
}

let secondUser = {
    email: "testemail@example.com",
    firstname: "Nathan",
    lastname: "Edwards",
    password: "testpassword",
    type: "driver",
    school: "University of California, Merced",
    isVerified: true
}

beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(user.password, 8)

    pool.query(`INSERT INTO users(email, firstname, lastname, password, type, school, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [user.email, user.firstname, user.lastname, hashedPassword, user.type, user.school, user.isVerified])
    
    pool.query(`INSERT INTO users(email, firstname, lastname, password, type, school, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [secondUser.email, secondUser.firstname, secondUser.lastname, hashedPassword,
            secondUser.type, secondUser.school, secondUser.isVerified])
})

beforeAll(async () => {
    await pool.query(`DELETE FROM group_requests`)
    await pool.query(`DELETE FROM user_session_tokens`)
    await pool.query(`DELETE FROM users`)
    await pool.query(`DELETE FROM groups`)
})

afterEach(async () => {
    await pool.query(`DELETE FROM group_requests`)
    await pool.query(`DELETE FROM user_session_tokens`)
    await pool.query(`DELETE FROM users`)
    await pool.query(`DELETE FROM groups`)
})

afterAll(() => {
    pool.end()
})

// What happens when admin leaves group?

/* ALL TESTS FOR THIS BLOCK PASS */
describe('Testing Group Creation', () => {

    // change tokens to headers instead of body
    test('Should create group successfully', async () => {
        const loginRes = await request(app).post(loginPath).send({...user})
        const res = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        expect(res.status).toBe(201)
        expect(res.body.success).toBe('Group successfully created!')
        expect(res.body.groupToken).not.toBe('')
        expect(res.body.groupToken).not.toBe(null)
        expect(res.body.groupId).not.toBe('')
    })

    test('Create group should fail -- Invalid or missing session token', async () => {
        await request(app).post(loginPath).send({...user})
        const res = await request(app).post(createPath)
        .set({ Authorization: `Bearer invalidtoken` })
        .send({ ...group })

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('Invalid token.')
    })

    test('Create group should fail -- No group name provided', async () => {
        const loginRes = await request(app).post(loginPath).send({...user})
        const res = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group, groupName: "" })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Please provide a group name.')
    })

    test('Create group should fail -- Group name is too long', async () => {
        var str = new Array(121 + 1).join('a');
        const loginRes = await request(app).post(loginPath).send({...user})
        const res = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group, groupName: str })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Group name exceeds the character limit (120 characters max).')
    })

    test('Create group should fail -- Group description is too long', async () => {
        var str = new Array(501 + 1).join('a');
        const loginRes = await request(app).post(loginPath).send({...user})
        const res = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group, description: str })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Description exceeds the character limit (500 characters max).')
    })

    test('Create group should fail -- Group privacy is not set', async () => {
        const loginRes = await request(app).post(loginPath).send({...user})
        const res = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group, privacy: "" })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Please select a privacy type.')
    })
})

describe('Testing Retrieval of a user\'s group(s)', () => {
    test('Successfully retrieve a user\'s group(s)', async () => {
        // login
        const loginRes = await request(app).post(loginPath).send({...user})
        
        // create a group
        await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // retrieve that group
        const res = await request(app).get(getPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe('Successfully retrieved user\'s group(s).')
        expect(res.body.group).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                group_id_suffix: expect.any(Number),
                group_name: expect.any(String),
                description: expect.any(String),
                privacy: expect.any(String),
                group_token: expect.any(String)
            })
        )
    })

    test('Should fail to retrieve user\'s group(s) -- Invalid session token', async () => {
        // login
        const loginRes = await request(app).post(loginPath).send({...user})
        
        // create a group
        await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // retrieve a group
        const res = await request(app).get(getPath)
        .set({ Authorization: `Bearer invalidtoken` })

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('Invalid token.')
    })
})

describe('Testing reassign admin option', () => {
    test('Successfully change the admin of a group', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        const decoded = jwt.verify(secondLoginRes.body.token, 'letscarpool')

        // Create group as first user
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // Join first user's group via token
        await request(app).patch(joinTokenPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ groupId: createRes.body.groupId, groupToken: createRes.body.groupToken })

        const res = await request(app).patch(changeAdminPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ userId: decoded.id })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe('Successfully reassigned admin role.')
    })
    
    test('Admin reassignment should fail -- Reassignee is not in the group', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group as first user
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // Join first user's group via token
        await request(app).patch(joinTokenPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ groupId: createRes.body.groupId, groupToken: createRes.body.groupToken })

        const res = await request(app).patch(changeAdminPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ userId: -1 })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Admin reasignee is not in the group.')
    })

    test('Admin change should fail -- User attempting a change is not currently an admin', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        const decoded = jwt.verify(loginRes.body.token, 'letscarpool')

        // Create group as first user
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // Join first user's group via token
        await request(app).patch(joinTokenPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ groupId: createRes.body.groupId, groupToken: createRes.body.groupToken })

        const res = await request(app).patch(changeAdminPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ userId: decoded.id })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('User attempting admin reassignment is currently not an admin and does not have permission.')
    })
})

describe('Testing Search for Group Feature', () => {
    test('Successfully retrieve all searched groups', async () => {
        // login
        const loginRes = await request(app).post(loginPath).send({...user})
        
        // create a group
        await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // create a second group
        await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group, groupName: "test group 2" })

        // retrieve that group
        const res = await request(app).get(searchPath + '?group_name=test')
        .set({ Authorization: `Bearer ${loginRes.body.token}` })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe('Successfully queried groups.')
        expect(res.body.groups).toContainEqual(
            expect.objectContaining({
                id: expect.any(Number),
                group_id_suffix: expect.any(Number),
                group_name: expect.any(String),
                description: expect.any(String),
                privacy: expect.any(String)
            })
        )
    })

    test('Search for group should fail -- Invalid session token', async () => {
        // login
        const loginRes = await request(app).post(loginPath).send({...user})
        
        // create a group
        await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // create a second group
        await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group, groupName: "test group 2" })

        // retrieve a group
        const res = await request(app).get(searchPath + '?group_name=test')
        .set({ Authorization: `Bearer invalidtoken` })

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('Invalid token.')
    })

    test('Search for group should fail -- No groups found with provided group name', async () => {
        // login
        const loginRes = await request(app).post(loginPath).send({...user})
        
        // create a group
        await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // create a second group
        await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group, groupName: "test group 2" })

        // retrieve that group
        const res = await request(app).get(searchPath + '?group_name=none')
        .set({ Authorization: `Bearer ${loginRes.body.token}` })

        expect(res.status).toBe(404)
        expect(res.body.error).toBe('No groups found with name \'none\'')
    })

    test('Search for group should filter out private groups', async () => {
        // login
        const loginRes = await request(app).post(loginPath).send({...user})
        
        // create a group
        await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group, privacy: 'private' })

        // create a second group
        await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group, groupName: "test group 2" })

        // retrieve that group
        const res = await request(app).get(searchPath + '?group_name=test')
        .set({ Authorization: `Bearer ${loginRes.body.token}` })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe('Successfully queried groups.')
        expect(res.body.groups).toContainEqual(
            expect.objectContaining({
                id: expect.any(Number),
                group_id_suffix: expect.any(Number),
                group_name: "test group 2",
                description: expect.any(String),
                privacy: expect.any(String)
            })
        )
    })
})

describe('Testing Group Join Requests', () => {
    test('Successfully send request to join a group', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ ...group })

        const res = await request(app).post(joinReqPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ groupId: createRes.body.groupId })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe('Successfully sent join request.')
    })

    test('Successfully get all join requests for a group', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ ...group })

        // Join request from first user to join second user's group
        await request(app).post(joinReqPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ groupId: createRes.body.groupId })

        const res = await request(app).get(`/api/group/requests?group_id=${createRes.body.groupId}`)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe('Successfully retrieved all join requests for group.')
        expect(res.body.requests).toContainEqual(expect.any(Object))
    })
    
    test('Successfully accept a group join request', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ ...group })

        const decoded = jwt.verify(loginRes.body.token, 'letscarpool')

        // Join request from first user to join second user's group
        await request(app).post(joinReqPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ groupId: createRes.body.groupId })

        const res = await request(app).post('/api/group/requests/accept')
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ userId: decoded.id, groupId: createRes.body.groupId })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe('Join request accepted successfully.')
    })

    test('Successfully decline a group join request', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ ...group })

        const decoded = jwt.verify(loginRes.body.token, 'letscarpool')

        // Join request from first user to join second user's group
        await request(app).post(joinReqPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ groupId: createRes.body.groupId })

        const res = await request(app).post('/api/group/requests/decline')
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ userId: decoded.id, groupId: createRes.body.groupId })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe('Join request declined successfully.')
    })

    test('Accept/Decline join request should fail -- User attempting to accept/decline is not in the requested group', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ ...group })

        const decoded = jwt.verify(loginRes.body.token, 'letscarpool')

        // Join request from first user to join second user's group
        await request(app).post(joinReqPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ groupId: createRes.body.groupId })

        const res = await request(app).post('/api/group/requests/accept')
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ userId: decoded.id, groupId: -1 })

        const secondRes = await request(app).post('/api/group/requests/decline')
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ userId: decoded.id, groupId: -1 })

        expect(res.status).toBe(400)
        expect(secondRes.status).toBe(400)
        expect(res.body.error).toBe('The user attempting to accept/decline a request is not in the requested group.')
        expect(secondRes.body.error).toBe('The user attempting to accept/decline a request is not in the requested group.')
    })

    test('Get join requests for a group should fail -- User is not in the group', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ ...group })

        // Join request from first user to join second user's group
        await request(app).post(joinReqPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ groupId: createRes.body.groupId })

        const res = await request(app).get(`/api/group/requests?group_id=${createRes.body.groupId}`)
        .set({ Authorization: `Bearer ${loginRes.body.token}` }) // first user is not in group; so cannot fetch requests for that group

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('The user attempting to get requests for this group is not in the group.')
    })

    test('Request feature should fail -- Invalid session token', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        const decoded = jwt.verify(loginRes.body.token, 'letscarpool')

        // Create group
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ ...group })

        // Join request from first user to join second user's group
        const res = await request(app).post(joinReqPath)
        .set({ Authorization: `Bearer invalidtoken` })
        .send({ groupId: createRes.body.groupId })

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('Invalid token.')
    })

    // test.todo('Request to join should fail -- Outstanding request to join another group')
    // Can have multiple outstanding requests, but once accepted to a group,
    // Delete the other requests

    test('Request to join should fail -- Group does not exist', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 

        // Join request from first user to join second user's group
        const res = await request(app).post(joinReqPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ groupId: -1 })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Group does not exist or is private.')
    })

    test('Request to join should fail -- Group is private', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ ...group, privacy: 'private' })

        // Join request from first user to join second user's group
        const res = await request(app).post(joinReqPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ groupId: createRes.body.groupId })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Group does not exist or is private.')
    })
})

describe('Testing Group Join Via Token', () => {
    test('Successfully join a group via group token', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group as first user
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // Join first user's group via token
        const res = await request(app).patch(joinTokenPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ groupId: createRes.body.groupId, groupToken: createRes.body.groupToken })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe('Successfully joined group.')
    })

    test('Join group should fail -- Invalid group token', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group as first user
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // Join first user's group via token
        const res = await request(app).patch(joinTokenPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ groupId: createRes.body.groupId, groupToken: 'invalidgrouptoken' })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Invalid group id or token.')
    })

    test('Join group should fail -- Invalid group id', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group as first user
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // Join first user's group via token
        const res = await request(app).patch(joinTokenPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ groupId: -1, groupToken: createRes.body.groupToken })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Invalid group id or token.')
    })

    test('Join group should fail -- Invalid session token', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 

        // Create group as first user
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // Join first user's group via token
        const res = await request(app).patch(joinTokenPath)
        .set({ Authorization: `Bearer invalidtoken` })
        .send({ groupId: createRes.body.groupId, groupToken: createRes.body.groupToken })

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('Invalid token.')
    })
})

describe('Testing Leave and Remove From Group', () => {
    beforeEach(async () => {
        // const loginRes = await request(app).post(loginPath).send({...user}) 
        // const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // // Create group as first user
        // const createRes = await request(app).post(createPath)
        // .set({ Authorization: `Bearer ${loginRes.body.token}` })
        // .send({ ...group })

        // // Join group as second user
        // await request(app).post(joinTokenPath)
        // .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        // .send({ groupId: createRes.body.groupId, groupToken: createRes.body.groupToken })
    })

    test('Successfully leave a group', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group as first user
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // Join group as second user
        await request(app).patch(joinTokenPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ groupId: createRes.body.groupId, groupToken: createRes.body.groupToken })
        
        // Leave group
        const res = await request(app).patch('/api/group/leave')
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ groupId: createRes.body.groupId })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe('Successfully left group.')
    })

    test('Successfully remove user from group', async () => {
        const loginRes = await request(app).post(loginPath).send({...user})
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        const decoded = jwt.verify(secondLoginRes.body.token, 'letscarpool')

        // Create group as first user
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // Join group as second user
        await request(app).patch(joinTokenPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ groupId: createRes.body.groupId, groupToken: createRes.body.groupToken })

        // Remove second user from group
        const res = await request(app).patch('/api/group/remove')
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ userId: decoded.id })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe('Successfully removed user from group.')
    })

    test('Leave should fail -- User attempting to leave is an admin and must first switch admins', async () => {
        const loginRes = await request(app).post(loginPath).send({...user}) 
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        // Create group as first user
        const createRes = await request(app).post(createPath)
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ ...group })

        // Join group as second user
        await request(app).patch(joinTokenPath)
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ groupId: createRes.body.groupId, groupToken: createRes.body.groupToken })
        
        // Leave group
        const res = await request(app).patch('/api/group/leave')
        .set({ Authorization: `Bearer ${loginRes.body.token}` })
        .send({ groupId: createRes.body.groupId })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Cannot leave group until user assigns the admin role to another user in the group.')
    })

    test('Remove/leave should fail -- Invalid session token', async () => {
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        const decoded = jwt.verify(secondLoginRes.body.token, 'letscarpool')

        const res = await request(app).patch('/api/group/remove')
        .set({ Authorization: `Bearer invalidtoken` })
        .send({ userId: decoded.id })

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('Invalid token.')
    })

    test('Remove should fail -- User that wants to remove is not the admin.', async () => {
        const loginRes = await request(app).post(loginPath).send({...user})
        const secondLoginRes = await request(app).post(loginPath).send({...secondUser})

        const decoded = jwt.verify(loginRes.body.token, 'letscarpool')

        const res = await request(app).patch('/api/group/remove')
        .set({ Authorization: `Bearer ${secondLoginRes.body.token}` })
        .send({ userId: decoded.id })

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('User is not the admin and does not have remove permission.')
    })
})