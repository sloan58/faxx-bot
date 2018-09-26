var debug = require('debug')('botkit:incoming_webhooks');
const path = require('path');

module.exports = function(webserver, controller) {

    debug('Configured POST /ciscospark/receive url for receiving events');
    webserver.post('/ciscospark/receive', function(req, res) {

        // NOTE: we should enforce the token check here

        // respond to Spark that the webhook has been received.
        res.status(200);
        res.send('ok');

        var bot = controller.spawn({});

        // Now, pass the webhook into be processed
        controller.handleWebhookPayload(req, res, bot);

    });

    // define a route to download a file from Twilio
    webserver.get('/download/:file(*)',(req, res) => {
        var file = req.params.file;
        var fileLocation = path.join('./uploads',file);
        console.log(fileLocation);
        res.download(fileLocation, file); 
    });

}
