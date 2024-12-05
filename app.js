const express = require('express');
const app = express();
const cron = require('node-cron');
const Post = require('./models/schema');
const mongoose = require('mongoose');
require('dotenv/config');

const bodyParser = require('body-parser');
const postsRoute = require('./routes/posts');

app.use(bodyParser.json());
app.use('/posts', postsRoute);

app.get('/', (req, res) => {
    res.send('Homepage');
});

// Schedule a cron job to check for expired posts every minute
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();

        // Update all "Live" posts with expired times to "Expired"
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

mongoose.connect(process.env.DB_CONNECTOR).then(() => {
    console.log('Your MongoDB connector is on...');
});

app.listen(3000, () => {
    console.log('Server is up and running...');
});