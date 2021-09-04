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
}