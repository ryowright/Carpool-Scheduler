const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const router = require('express').Router()

const pool = require('../connectdb')
const auth = require('../middleware/auth')

/* CREATE GROUP -- TESTS DONE */
router.post('/create', auth, (req, res) => {
  const { groupName, description, privacy } = req.body
  const adminId = req.userId

  if (!groupName) {
    return res.status(400).send({ error: 'Please provide a group name.' })
  }

  if (groupName.length > 120) {
    return res.status(400).send({ error: 'Group name exceeds the character limit (120 characters max).' })
  }

  if (description.length > 500) {
    return res.status(400).send({ error: 'Description exceeds the character limit (500 characters max).' })
  }

  if (!privacy) {
    return res.status(400).send({ error: 'Please select a privacy type.' })
  }

  const groupToken = crypto.randomBytes(64).toString('hex')
  let groupIdSuffix = Math.floor(1000 + Math.random() * 9000)
  let groupId
  const groupSuffixes = []

  pool.query('SELECT group_name, group_id_suffix FROM groups WHERE group_name=$1 AND group_id_suffix=$2',
    [groupName, groupIdSuffix], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      if (results.rows.length > 0) {
        results.rows.forEach((row) => {
          groupSuffixes.push(row.group_id_suffix)
        })
      }

      while (groupSuffixes.includes(groupIdSuffix)) {
        groupIdSuffix = Math.floor(1000 + Math.random() * 9000)
      }

      pool.query(`INSERT INTO groups(group_name, group_id_suffix, description, privacy, group_token)
        VALUES ($1, $2, $3, $4, $5) RETURNING id`, [groupName, groupIdSuffix, description, privacy, groupToken], (err, results) => {
        if (err) {
          return res.status(500).send({ error: err })
        }

        groupId = results.rows[0].id
        pool.query("UPDATE users SET group_id=$1, admin='true' WHERE id=$2", [groupId, adminId])
        return res.status(201).send({ success: 'Group successfully created!', groupToken, groupId })
      })
    }
  )
})

/* REASSIGN ADMIN ROLE -- TESTS DONE */
router.patch('/admin', auth, (req, res) => {
  const id = req.userId
  const { userId } = req.body

  // Group ids of current admin and reassignee have to match
  pool.query(`SELECT id, group_id, admin FROM users WHERE id=$1 AND group_id IN (
    SELECT group_id FROM users WHERE id=$2)`, [id, userId], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length === 0) {
      return res.status(400).send({ error: 'Admin reasignee is not in the group.' })
    }

    if (results.rows[0].admin === false) {
      return res.status(400).send({ error: 'User attempting admin reassignment is currently not an admin and does not have permission.' })
    }

    pool.query('UPDATE users SET admin=true WHERE id=$1', [userId], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      pool.query('UPDATE users SET admin=false WHERE id=$1', [id], (err, results) => {
        if (err) {
          return res.status(500).send({ error: err })
        }
      })

      return res.status(200).send({ success: 'Successfully reassigned admin role.' })
    })
  })
})

/* GET A USER'S GROUP -- TESTS DONE */
router.get('/me', auth, (req, res) => {
  const id = req.userId

  pool.query(`SELECT * FROM groups WHERE id IN (
    SELECT group_id FROM users WHERE id=$1)`, [id], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length === 0) {
      return res.status(400).send({ error: 'No group(s) exist for this user.' })
    }
    return res.status(200).send({ success: 'Successfully retrieved user\'s group(s).', group: results.rows[0] })
  })
})

/* GET A GROUP BY ITS ID */
router.get('/get-group', auth, (req, res) => {
  const groupId = req.query.id

  if (!groupId) {
    return res.status(404).send({ group: null })
  }

  pool.query(`SELECT id, group_id_suffix, group_name, description, privacy
    FROM groups WHERE id=$1`, [groupId], (err, results) => {
    if (err) {
      console.log('database error')
      return res.status(500).send({ error: err })
    }

    const group = results.rows[0]
    if (group.privacy === 'private') {
      return res.status(404).send({ group: null })
    }

    return res.status(200).send({ group })
  })
})

/* SEARCH FOR GROUPS -- TESTS DONE */
router.get('/search', auth, (req, res) => {
  const searchName = req.query.group_name

  pool.query(`SELECT DISTINCT id, group_id_suffix, group_name, privacy
  FROM groups WHERE group_name LIKE '%' || $1 || '%' LIMIT 5`,
  [searchName], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    // Filter out groups that are private
    const groups = results.rows.filter(group => group.privacy !== 'private')

    return res.status(200).send({
      // success: 'Successfully queried groups.',
      groups
    })
  })
})

/* REQUEST TO JOIN GROUP -- TESTS DONE */
router.post('/join-request', auth, (req, res) => {
  const id = req.userId
  const groupId = req.body.groupId

  pool.query('SELECT id, privacy FROM groups WHERE id=$1', [groupId], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length === 0 || results.rows[0].privacy === 'private') {
      return res.status(400).send({ error: 'Group does not exist or is private.' })
    }

    pool.query('INSERT INTO group_requests(user_id, group_id) VALUES ($1, $2)', [id, groupId], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      } else {
        return res.status(200).send({ success: 'Successfully sent join request.' })
      }
    })
  })
})

/* JOIN GROUP VIA GROUP TOKEN -- TESTS DONE */
router.patch('/join-token', auth, (req, res) => {
  const id = req.userId
  const { groupId, groupToken } = req.body

  // group id should match group token in groups table
  // user id should be from header token
  pool.query('SELECT id, group_token FROM groups WHERE id=$1 AND group_token=$2', [groupId, groupToken], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length === 0) {
      return res.status(400).send({ error: 'Invalid group id or token.' })
    }

    pool.query('UPDATE users SET group_id=$1 WHERE id=$2', [groupId, id], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      return res.status(200).send({ success: 'Successfully joined group.' })
    })
  })
})

/* GET ALL JOIN REQUESTS FOR A GROUP -- TESTS DONE */
router.get('/requests', auth, (req, res) => {
  const id = req.userId
  const groupId = Number(req.query.group_id)

  pool.query('SELECT group_id FROM users WHERE id=$1', [id], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows[0].group_id !== groupId) {
      return res.status(400).send({ error: 'The user attempting to get requests for this group is not in the group.' })
    }

    pool.query('SELECT * FROM group_requests WHERE group_id=$1', [groupId], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      const requests = results.rows

      if (requests.length === 0) {
        return res.status(400).send({ error: 'Request does not exist.' })
      }

      return res.status(200).send({
        success: 'Successfully retrieved all join requests for group.',
        requests
      })
    })
  })
})

/* CHECK IF A USER HAS A PENDING REQUEST FOR A GROUP -- DONE (NEEDS TESTS) */
router.get('/myrequest', auth, (req, res) => {
  const id = req.userId
  const groupId = Number(req.query.group_id)

  pool.query('SELECT * FROM group_requests WHERE user_id=$1 AND group_id=$2', [id, groupId], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    const requests = results.rows

    if (requests.length === 0) {
      return res.status(400).send({ error: 'User does not have a pending request to join this group.' })
    }

    return res.status(200).send({
      success: 'User has a pending request to join this group.',
      reqPending: true
    })
  })
})

/* ACCEPT GROUP JOIN REQUESTS -- TESTS DONE */
router.post('/requests/accept', auth, (req, res) => {
  const id = req.userId
  const { userId, groupId } = req.body

  pool.query('SELECT group_id FROM users WHERE id=$1', [id], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows[0].group_id !== groupId) {
      return res.status(400).send({ error: 'The user attempting to accept/decline a request is not in the requested group.' })
    }

    // Delete all the outstanding requests so users can only
    // join one group at a time
    pool.query('DELETE FROM group_requests WHERE user_id=$1', [userId], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      pool.query('UPDATE users SET group_id=$1 WHERE id=$2', [groupId, userId], (err, results) => {
        if (err) {
          return res.status(500).send({ error: err })
        }

        return res.status(200).send({ success: 'Join request accepted successfully.' })
      })
    })
  })
})

/* DECLINE GROUP REQUESTS -- TESTS DONE */
router.post('/requests/decline', auth, (req, res) => {
  const id = req.userId
  const { userId, groupId } = req.body

  pool.query('SELECT group_id FROM users WHERE id=$1', [id], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows[0].group_id !== groupId) {
      return res.status(400).send({ error: 'The user attempting to accept/decline a request is not in the requested group.' })
    }

    pool.query('DELETE FROM group_requests WHERE user_id=$1 AND group_id=$2', [userId, groupId], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      return res.status(200).send({ success: 'Join request declined successfully.' })
    })
  })
})

/* LEAVE GROUP -- TESTS DONE */
// NOTE: What happens if admin leaves group?
router.patch('/leave', auth, (req, res) => {
  const id = req.userId
  const { groupId } = req.body

  pool.query('SELECT id, admin FROM users WHERE id=$1', [id], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows[0].admin === true) {
      return res.status(400).send({ error: 'Cannot leave group until user assigns the admin role to another user in the group.' })
    }

    pool.query('UPDATE users SET group_id=null WHERE id=$1 AND group_id=$2 RETURNING id', [id, groupId], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      if (results.rows.length === 0) {
        return res.status(400).send({ error: 'Inavlid user/group id.' })
      }

      return res.status(200).send({ success: 'Successfully left group.' })
    })
  })
})

/* REMOVE FROM GROUP -- TESTS DONE */
router.patch('/remove', auth, (req, res) => {
  const id = req.userId
  const removeId = req.body.userId

  // check that user is admin
  // check that user to remove is in same group as admin
  pool.query('SELECT id, admin, group_id FROM users WHERE id=$1', [id], (err, results) => {
    if (err) {
      return res.status(500).send({ error: err })
    }

    if (results.rows.length === 0) {
      return res.status(500).send({ error: 'User not found.' })
    }

    const isAdmin = results.rows[0].admin
    const groupId = results.rows[0].group_id

    if (!isAdmin) {
      return res.status(400).send({ error: 'User is not the admin and does not have remove permission.' })
    }

    pool.query('UPDATE users SET group_id=null WHERE id=$1 AND group_id=$2 RETURNING id', [removeId, groupId], (err, results) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      if (results.rows.length === 0) {
        return res.status(400).send({ error: 'Invalid user/group id.' })
      }

      return res.status(200).send({ success: 'Successfully removed user from group.' })
    })
  })
})

module.exports = router
