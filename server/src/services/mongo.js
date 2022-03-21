const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!')
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongoConnect() {
    return await mongoose.connect(MONGO_URL);
}

async function mongoClose() {
    return await mongoose.connection.close();
}

module.exports = {
    mongoConnect,
    mongoClose,
}