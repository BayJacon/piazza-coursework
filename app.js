const express = require('express');
const app = express();

const mongoose = require('mongoose');
require('dotenv/config');

const bodyParser = require('body-parser');
const piazzaRoute = require('./routes/piazza');

app.use(bodyParser.json());
app.use('/posts', piazzaRoute);

app.get('/', (req, res) => {
    res.send('Homepage');
});

mongoose.connect(process.env.DB_CONNECTOR).then(() => {
    console.log('Your MongoDB connector is on...');
});

app.listen(3000, () => {
    console.log('Server is up and running...');
});