'use strict';

var https = require('https');
var crypto = require('crypto');
var querystring = require('querystring');
var humanize = require('humanize-duration');

module.exports.webhook = (event, context, callback) => {
    var payload = JSON.parse(querystring.parse(event.body).payload);

    // parse travis payload into discord webhook format
    var requestData = {
        embeds: [{
            type: "rich",
            author: {
                name: 'Build #' + payload.number,
                url: payload.build_url,
                icon_url: 'https://cdn.travis-ci.org/images/logos/TravisCI-Mascot-1-20feeadb48fc2492ba741d89cb5a5c8a.png'
            },
            footer: {
                text: payload.committer_name.split(' ')[0] + ' committed',
                icon_url: 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(payload.committer_email).digest("hex")
            },
            fields: [{
                name: humanize(payload.duration * 1000),
                value: '[`' + payload.commit.substring(0,7) + '`](' + payload.compare_url + ') ' + payload.message,
                inline: false
            }]
        }]
    };

    // change color based on build status
    if (payload.status === 0) {
        requestData.embeds[0].color = '65280';
    } else {
        requestData.embeds[0].color = '16711680';
    }

    // specify https request options
    var options = {
        host: 'discordapp.com',
        port: 443,
        path: process.env.WEBHOOK,
        headers: { 'Content-Type': 'application/json' },
        method: "POST"
    };

    // execute request
    var request = https.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
    });

    request.write(JSON.stringify(requestData));
    request.end();
};
