var http = require('http'),
	url = require('url'),
	mongo = require('mongoskin'),
	countlyConfig = require('./config'), // Config file for the app
	port = countlyConfig.api.port,
	countlyDb = mongo.db(countlyConfig.mongodb.host + ':' + countlyConfig.mongodb.port + '/' + countlyConfig.mongodb.db + '?auto_reconnect');


http.Server(function(req, res) {
	var urlParts = url.parse(req.url, true);
	console.log('req=' + req );
	console.log('urlParts=' + urlParts );
	
	var result = { 'name': 'HY', 'password':'123456'};
	
	res.writeHead(200, {'Content-Type': 'application/json'});
	res.write(JSON.stringify(result));
	res.end();
	
	
	
}).listen(port);
	