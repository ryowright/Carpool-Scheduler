const jwt = require('jsonwebtoken')
const pool = require('../connectdb')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '') // works with postman
        // const token = req.headers.authorization.replace('Bearer ', '') // works with axios
        const decoded = jwt.verify(token, 'letscarpool')
        pool.query(`SELECT * FROM user_session_tokens WHERE user_id=$1 AND session_token=$2`, [decoded.id, token], (err, results) => {
            if (err) {
                return res.status(500).send({ err })
            }

            if (results.rows[0].length === 0) {
                return res.status(404).send({ error: 'Token not found for user.' })
            }
        })
    } catch (e) {
        res.status(401).send(e)
    }
}

module.exports = auth