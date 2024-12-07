const User = require('./models/User'); // Import User model
const jsonwebtoken = require('jsonwebtoken');

async function auth(req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send({ message: 'Access denied' });

    try {
        const verified = jsonwebtoken.verify(token, process.env.TOKEN_SECRET); // Verify the token
        const user = await User.findById(verified._id); // Fetch user details
        if (!user) return res.status(404).send({ message: 'User not found' });

        req.user = {
            _id: user._id,
            username: user.username // Attach username
        };
        next();
    } catch (err) {
        res.status(401).send({ message: 'Invalid token' });
    }
}

module.exports = auth;