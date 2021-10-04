const jwt = require('jsonwebtoken')
const pool = require('../connectdb')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '') // works with postman
    const decoded = jwt.verify(token, 'letscarpool')
    pool.query('SELECT * FROM user_session_tokens WHERE user_id=$1 AND session_token=$2', [decoded.id, token], (err, results) => {
      if (err) {
        throw new Error(err)
      }

      if (!token || !decoded || results.rows.length === 0) {
        // throw new Error('Invalid token.')
        req.token = null
        req.userId = null
      } else {
        req.token = token
        req.userId = decoded.id
      }
      next()
    })
  } catch (e) {
    return res.status(401).send({ error: 'Invalid token.' })
  }
}

module.exports = auth
