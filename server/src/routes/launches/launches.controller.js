const {
    getAllLaunches,
    scheduleNewLaunch,
    existLaunchId,
    abortLaunchId,
} = require('../../models/launches.model');

const {
    getPagination
} = require('../../services/query');

async function httpGetAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query);
    const launches = await getAllLaunches(skip, limit);
    return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;

    //Validate that there is no missing input
    if (!launch.mission || !launch.rocket || !launch.target || !launch.launchDate) {
        return res.status(400).json({
            error: "Missing required launch property"
        })
    }

    //Validate that launchData input is valid 
    launch.launchDate = new Date(launch.launchDate);
    if (launch.launchDate.toString() === 'Invalid Date') {
        return res.status(400).json({
            error: 'Invalid launch date'
        })
    }
    /* Alternative
    if (isNaN(launch.launchDate.valueOf())) {
        return res.status(400).json({
                error: 'Invalid launch date'
            })
        }
    }
    */

    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const launchId = Number(req.params.id);
    const abortedLaunch = await existLaunchId(launchId);

    if (!abortedLaunch) {
        return res.status(404).json({
            error: 'Launch not found',
        })
    } else {
        aborted = await abortLaunchId(launchId);
        return res.status(200).json({ ok: aborted });
    }

}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
}