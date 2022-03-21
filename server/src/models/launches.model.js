const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100;

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}

async function existLaunchId(launchId) {
    return await findLaunch({ flightNumber: launchId });
}

async function saveLaunch(launch) {
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    });
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';
async function loadLaunchesData() {
    const firstlaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });
    if (firstlaunch) {
        console.log('Launch data already loaded');
    } else {
        await populateLaunchesData();
    }
}

async function populateLaunchesData() {
    console.log('Downloading launches data ...');
    const response = await axios.post(SPACEX_API_URL, {
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        'name': 1,
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1,
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log('Launch data cold not be downloaded');
        throw new Error('Launch data could not be downloaded');
    }

    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
        const customers = launchDoc['payloads'].flatMap(payload => payload.customers);
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: new Date(launchDoc['date_local']),
            customers,
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
        }
        console.log(`${launch.flightNumber} - ${launch.mission}`);
        await saveLaunch(launch);
    }
}

async function getAllLaunches(skip, limit) {
    return await launchesDatabase
        .find({}, { _id: 0, __v: 0 })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber');

    //In case there are no launches at all in MongoDB
    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function scheduleNewLaunch(launch) {
    //Is the target planet habitable?
    const planet = await planets.findOne({ kepler_name: launch.target }, { _id: 0, __v: 0 });

    if (!planet) {
        throw new Error(`Planet ${launch.target} is not habitable`);
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Zero to Mastery', 'NASA'],
        flightNumber: newFlightNumber,
    })
    await saveLaunch(newLaunch);
}

async function abortLaunchId(launchId) {
    const abortedLaunch = await launchesDatabase.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false,
    });
    return abortedLaunch.modifiedCount === 1;
}

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    existLaunchId,
    abortLaunchId,
    loadLaunchesData,
}