const express = require('express');
const app = express();
const cron = require('node-cron');
const mongoose = require('mongoose');
require('dotenv/config');

const bodyParser = require('body-parser');
const postsRoute = require('./routes/posts');
const authRoute = require('./routes/auth');
const Post = require('./models/Post');

// Middleware
app.use(bodyParser.json());
app.use('/api/user', authRoute); // Authentication routes
app.use('/posts', postsRoute); // Posts routes 

// Homepage route
app.get('/', (req, res) => {
    res.send('Homepage');
});

// Check for expired posts every minute
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();

        // Update live posts to expired when "now" passes "expiration time"
        const result = await Post.updateMany(
            { expirationTime: { $lt: now }, status: 'Live' },
            { $set: { status: 'Expired' } }
        );

        if (result.modifiedCount > 0) {
            console.log(`${result.modifiedCount} posts updated to "Expired".`);
        }
    } catch (err) {
        console.error('Error updating expired posts:', err.message);
    }
});

// Connect to database
mongoose.connect(process.env.DB_CONNECTOR)
    .then(() => {
        console.log('Your MongoDB is connected!');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
    });

// Start the server
app.listen(3000, () => {
    console.log('Server is up and running...');
});