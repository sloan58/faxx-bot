let fs = require('fs');

module.exports = function(controller) {

    controller.hears(['^fax'], 'direct_message,direct_mention', function(bot, message) {

        bot.createConversation(message, function(err, convo) {
            bot.reply(message, `Okay, got it!  I'll fax this document for you.`);
            if (message.raw_message.data.files) {
                bot.retrieveFileInfo(message.raw_message.data.files[0], function(err, file_info) {
                    if (file_info['content-type'] == 'text/plain') {
                        bot.retrieveFile(message.raw_message.data.files[0], function(err, file) {
                        fs.writeFile(`/Users/masloan/Code/js/fax-bot/${file_info.filename}`, file, function(err) {
                            if(err) {
                                bot.reply(message,`I'm sorry...There was a problem sending your fax.`);
                                return console.log(err);
                            }
                                bot.reply(message,`Alright!  Your fax was sent!`);
                            }); 
                        });
                    }
                });
            }
        });
    });

};
