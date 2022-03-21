const http = require('http');
//const process = require('process');
require('dotenv').config();
const app = require('./app.js');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');
const { mongoConnect } = require('./services/mongo');


const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

async function startServer() {
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchesData();

    server.listen(PORT, () => {
        console.log(`Server is listening at port ${PORT}`);
    });
}

startServer();

