const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoClose } = require('../../services/mongo');

describe('Test Launches API', () => {
    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoClose()
    });

    describe('Test GET /launches', () => {
        test('It should respond with status code 200', async () => {
            await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);
            //expect(response).toBe(200);
        });
    });

    describe('Test POST /launches', () => {
        requestLaunchData = {
            "mission": "Explorer 1",
            "rocket": "ZTM Experimental IS1",
            "target": "Kepler-442 b",
            "launchDate": "January 30, 2028"
        }

        requestLaunchDataWithoutDate = {
            "mission": "Explorer 1",
            "rocket": "ZTM Experimental IS1",
            "target": "Kepler-442 b",
        }

        requestLaunchDataInvalidDate = {
            "mission": "Explorer 1",
            "rocket": "ZTM Experimental IS1",
            "target": "Kepler-442 b",
            "launchDate": "xxxxxx"
        }

        test('It should respond with status code 201', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(requestLaunchData)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(201);

            const requestLaunchDate = new Date(requestLaunchData.launchDate).valueOf();
            const responseLaunchDate = new Date(response.body.launchDate).valueOf();
            expect(requestLaunchDate).toBe(responseLaunchDate)

            expect(response.body.mission).toBe('Explorer 1');
            expect(response.body).toMatchObject(requestLaunchDataWithoutDate);

        });
        test('It should catch missing properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(requestLaunchDataWithoutDate)
                .expect(400)
                .expect('Content-Type', /json/)
            //expect(response.body.error).toBe("Missing required launch property");
            expect(response.body).toStrictEqual({
                error: "Missing required launch property"
            });
        });
        test('It should catch invalid launch date', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(requestLaunchDataInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);
            //expect(response.body.error).toBe('Invalid launch date');
            expect(response.body).toStrictEqual({
                error: 'Invalid launch date'
            });
        });
    });
});

