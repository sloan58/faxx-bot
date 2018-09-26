const fs = require('fs')
const path = require('path')
const env = require('node-env-file');
const client = require('twilio')(process.env.twilio_sid, process.env.twilio_token);

let fileName = ''
let fileNameAndPath = ''

module.exports = function(controller) {

    controller.hears(['^fax'], 'direct_message,direct_mention', function(bot, message) {


        if (message.raw_message.data.files) {
            bot.retrieveFileInfo(message.raw_message.data.files[0], function(err, file_info) {
                // if (file_info['content-type'] == 'text/plain') {
                    bot.retrieveFile(message.raw_message.data.files[0], function(err, file) {
                        fileName = file_info.filename
                        fileNameAndPath = path.join(process.env.PWD, 'uploads', fileName)
                        fs.writeFile(fileNameAndPath, file, function(err) {
                            if(err) {
                                bot.reply(message,`I'm sorry...There was a problem uploading the file.`);
                                return console.log(err);
                            }
                        });
                    });
                // }
            });
        }

        bot.createConversation(message, function(err, convo) {



            // create a path to send a success message
            convo.addMessage({
                text: 'Excellent!  Your fax has been sent to {{ vars.phoneNumber }}!',
            },'fax_sent');


            // Create a yes/no question in the default thread...
            convo.addQuestion({
                text: `Okay, I can send a fax for you.\n\n` +
                      `Where would you like to send this document?`,
            }, [
                {
                    pattern: '.*',
                    callback: function(response, convo) {
                        convo.setVar('phoneNumber', '+1' + response.text);
                        client.fax.faxes
                        .create({
                            from: process.env.twilio_from,
                            to: '+1' + response.text,
                            mediaUrl: process.env.public_address + `/download/WebexShareFAQ.pdf`
                        })
                        .then(message => console.log(message))
                        .done();
                        convo.gotoThread('fax_sent');
                    },
                },
                {
                    pattern: bot.utterances.no,
                    callback: function(response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ],{},'default')

            convo.activate()

            // bot.reply(message, `Okay, got it!  I'll fax this document for you.`);
        });
    });

};
