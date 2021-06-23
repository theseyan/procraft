var request = require('request');

module.exports = {
    setup: (app) => {
        app.post('/eventsHook', (req, res) => {

            // Send POST Payload to registered webhooks
            request.post('http://127.0.0.1:8082/', {
                json: {
                    token: '5981981c-8b3c-4f38-86ea-f3c58dc44ca6',
                    data: req.body
                },
            }, function (error, response, body) {});
            res.status(200).send('');

        });
        app.get('/', (req, res) => {
            res.status(200).send('You found me :)');
        });
    }
};