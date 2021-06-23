var api = require('../../../core/api');

module.exports = {

    type: 'post',

    route: '/game/chat/broadcast',

    handle: (req, res) => {
        api.chatBroadcast(req.body.message).then(data => {
            res.status(200).send({
                message: 'Message broadcasted successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to broadcast message",
                error: err
            });
            return;
        });
    }

};