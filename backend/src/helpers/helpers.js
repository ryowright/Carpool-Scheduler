const bcrypt = require('bcrypt')
const sgMail = require('@sendgrid/mail')
const pool = require('../connectdb')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendVerifyEmail = (email, firstname, emailToken, hostURL) => {
    const msg = {
        to: email, // Change to your recipient
        from: 'ryoanything@gmail.com', // Change to your verified sender
        subject: 'Verify your Carpool Scheduler Email',
        text: `
            Hello ${firstname}, thank you for creating a Carpool Scheduler account.
            Please copy and paste the address below to verify your account.
            ${hostURL}/api/user/verify-email?token=${emailToken}`,
        html: `
            <h1>Hello ${firstname},</h1>
            <p>thank you for creating a Carpool Scheduler account.</p>
            <p>Please click the link below to verify your account.</p>
            <a href="${hostURL}/api/user/verify-email?token=${emailToken}">Verify your account</a>
            <h3>If you did not register this account, please ignore this email.</h3>
            `
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
    })
}

const sendPasswordResetEmail = (email, firstname, resetToken, hostURL) => {
    const msg = {
        to: email, // Change to your recipient
        from: 'ryoanything@gmail.com', // Change to your verified sender
        subject: 'Carpool Scheduler - Reset Account Password',
        text: `
            Hello ${firstname},
            A password reset was requested for your Carpool Scheduler account.
            If you did not request a password reset, please ignore this
            email. Otherwise, the link below will reset your password.
            ${hostURL}/reset-password/${resetToken}`,
        html: `
            <h1>Hello ${firstname},</h1>
            <p>A password reset was requested for your Carpool Scheduler account.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>Otherwise, the link below will reset your password.</p>
            <a href="${hostURL}/reset-password/${resetToken}">Reset Password</a>
            `
            // Link redirects to frontend endpoint
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
    })
}

const verifyUserLogin = async (password, hashedPassword, isVerified) => {
    var object = {
        authenticated: false,
        status: 401,
        message: ""
    }

    if (!isVerified) {
        object.message = 'User is not verified.'

        return object
    }

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
        object.message = 'Incorrect credentials.'

        return object
    }

    object.authenticated = true
    object.status = 200
    object.message = 'Login successful.'
    return object
}

const generateGroupSuffix = (groupName) => {
    let val = Math.floor(1000 + Math.random() * 9000)
    let loop = true

    while (loop) {
        pool.query(`SELECT group_name, group_id_suffix FROM groups
        WHERE group_name=$1 AND group_id_suffix=$2`, [groupName, val], (err, results) => {
            if (results.rows.length === 0) {
                loop = false
                return
            }
            val = Math.floor(1000 + Math.random() * 9000)
        })
    }
    return val
}

module.exports = {
    verifyUserLogin,
    sendVerifyEmail,
    sendPasswordResetEmail,
    generateGroupSuffix,
}