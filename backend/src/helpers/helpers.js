const sgMail = require('@sendgrid/mail')
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
    let authenticated = false 

    if (!isVerified) {
        return {
            authenticated,
            status: 401,
            message: 'User is not verified.',
        }
    }

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
        return {
            authenticated,
            status: 401,
            message: 'Incorrect credentials.',
        }
    }

    authenticated = true
    return {
        authenticated,
        status: 200,
        message: 'Login successful',
    }
}

module.exports = {
    verifyUserLogin,
    sendVerifyEmail,
    sendPasswordResetEmail,
}