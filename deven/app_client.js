/**
 * Created with JetBrains WebStorm.
 * User: Deven
 * Date: 12-11-29
 * Time: 下午9:15
 * To change this template use File | Settings | File Templates.
 *
 * app_client: The testing client of the app.js server.
 */

//---------------------------------------------------------------

var http = require('http');
var countlyConfig = require('./config');

var hostHttp = countlyConfig.api.host
    , hostHttpPort = countlyConfig.api.port
    ;

//---------------------------------------------------------------

var data = JSON.stringify({ "location":[121.9988, 31.381], "distance": 5 });

var cookie = 'something=anything'

var requestHeaders = {
    'Host': hostHttp,
    'Cookie': cookie,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data, 'utf8')
};

var httpOptions = {
    hostname: hostHttp,
    port: hostHttpPort,
    path: '/action',
    method: 'POST',
    headers: requestHeaders
};

var req = http.request(httpOptions, function(res) {

    console.log('Response STATUS: ' + res.statusCode);
    console.log('Response HEADERS: ' + JSON.stringify(res.headers));

    res.setEncoding('utf8');

    res.on('data', function (chunk) {
        console.log('Response BODY: ' + chunk);
    });

    res.on("end", function() {
        //clearTimeout(timeoutEvent);
        console.log("Response end!!!");
    })

    res.on("close", function(e) {
        //clearTimeout(timeoutEvent);
        console.log("Response close!!!");
    })

    res.on("abort", function() {
        console.log("Response abort!!!");
    });
});


req.on('data', function(chunk) {
    console.log('Request data: ' + chunk);
});

req.on('end', function() {
    console.log('Request end... ');
});

// you'd also want to listen for errors in production
req.on('error', function(e) {
    console.log('Request problem: ' + e.message);
});

//---------------------------------------------------------------


// write data to request body
req.write(data);

req.end();


//---------------------------------------------------------------
