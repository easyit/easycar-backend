var http = require('http'),
	url = require('url'),
	mongo = require('mongoskin'),
	countlyConfig = require('./config'), // Config file for the app
	port = countlyConfig.api.port,
	countlyDb = mongo.db(countlyConfig.mongodb.host + ':' + countlyConfig.mongodb.port + '/' + countlyConfig.mongodb.db + '?auto_reconnect');


// Checks app_key from the http request against "apps" collection. 
// This is the first step of every write request to API.
function validateAppForWriteAPI(getParams) {
	return true;
}

var fetchCollection = function(getParams, collection, res) {
	countlyDb.collection(collection).find({}).toArray( function(err, result){
		if (!result.length) {
			result = {};
		}
		
		console.log(result);
		
		if (getParams.callback) {
			result = getParams.callback + "(" + JSON.stringify(result) + ")";
		} else {
			result = JSON.stringify(result);
		}
				
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.write(result);
		res.end();
	});
}

function processNearby(req, res, urlParts ) {
    var	queryString = urlParts.query;
	var getParams = {
					'app_key': queryString.app_key,
					'method': queryString.method,
					'event': queryString.event,
					'callback': queryString.callback,
					'action': queryString.action
				};
	
	fetchCollection( getParams, 'locations',res);
	
}

///////////////////////////////////////////////////////////////////////////////
function  sendReply(res,error, data){
        var result = { 'error' : error,
                        'data' : data
        };  

		res.writeHead(200, {'Content-Type': 'application/json'});
	    res.write(JSON.stringify(result));
	    res.end();
}

function createUser(res, newUser) {
		countlyDb.collection('members').insert(newUser, {safe: true}, function(err, user) {
		    var result = { 'error' : 1}; 
		
			if (user && !err) {
				sendReply(res, 0, user[0]);
			} else {
				sendReply(res, -1, {});				
			}
		});
}



function processUserCreation(req,res, urlParts){
	var	queryString = urlParts.query;
	var getParams = {
					'device_id': queryString.device,
					'username': queryString.username,
					'email': queryString.email,
					'phone': queryString.phone,
				};
						
	countlyDb.collection('members').findOne({ $or : [ {email: getParams.email}, {username: getParams.username} ] }, function(err, member) {
			if (member || err) {
				sendReply(res, -2, {});	
				return false;
			} else {
				createUser(res,getParams);
			}
		});			

}

function processDefault(req, res, urlParts ) {

	var result = { 'data': [ 
					{'id':123, created_at:'2012-10-22 17:12:34', 'text':'Text1', 'source':'source1' , 'name': 'HY', 'phone':'87181025', 'lat':31.371004,'lon':120.733192},
	                {'id':124, created_at:'2012-10-22 12:12:34', 'text':'Text2', 'source':'source2' , 'name': 'Deven', 'phone':'87181025', 'lat':31.371114,'lon':120.733182},
	                {'id':125, created_at:'2012-10-22 11:32:34', 'text':'Text2', 'source':'source3' , 'name': 'Monica', 'phone':'87181027', 'lat':31.371124,'lon':120.732192}
	                        ] } ;
	
	res.writeHead(200, {'Content-Type': 'application/json'});
	res.write(JSON.stringify(result));
	res.end();
}

http.Server(function(req, res) {
	var urlParts = url.parse(req.url, true);
	var	queryString = urlParts.query;
	
	console.log('req.url=' + req.url );
	console.log('urlParts=' + urlParts.pathname );
	
	//TODO: besides some special function like register/login, we can validate the commom API access here.
	
//var getParams = {
//    'app_id': '',
//    'app_cc': '',
//    'app_key': queryString.app_key,
//    'ip_address': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
//    'sdk_version': queryString.sdk_version,
//    'device_id': queryString.device_id,
//    'metrics': queryString.metrics,
//    'events': queryString.events,
//    'session_duration': queryString.session_duration,
//    'session_duration_total': queryString.session_duration_total,
//    'is_begin_session': queryString.begin_session,
//    'is_end_session': queryString.end_session,
//    'user' : {
//        'country': 'Unknown',
//        'city': 'Unknown'
//    },
//    'timestamp': queryString.timestamp
//};
//
//if ( !validateAppForWriteAPI(getParams)	)	{
//    res.writeHead(400);
//    res.end();
//    return false;
//}

	
	switch(urlParts.pathname) {
	case '/nearby':
		processNearby(req,res, urlParts);
		break;
	case '/users/create':
	    processUserCreation(req,res, urlParts);
	    break;
	case '/act':
	
	case '/login':
	case '/logout':
	default:
		processDefault(req,res, urlParts);
	    break;
	}
	
}).listen(port);
	