var http = require('http'),
    express = require('express'),
    expose = require('express-expose');
	url = require('url'),
	mongo = require('mongoskin'),
	countlyConfig = require('./config'), // Config file for the app
	port = countlyConfig.api.port,
	countlyDb = mongo.db(countlyConfig.mongodb.host + ':' + countlyConfig.mongodb.port + '/' + countlyConfig.mongodb.db + '?auto_reconnect');
	
	
function sha1Hash(str, addSalt) {
	var salt = (addSalt)? new Date().getTime() : "";
	return crypto.createHmac('sha1', salt + "").update(str + "").digest('hex');
}

function validateRequest(req, res) {
	return true;
}

///////////////////////////////////////////////////////////////////////////////
function  sendReply(res,error, data){
        var result = { 'error' : error,
                        'data' : data
        };  
        
        res.json(result);
}


var app = module.exports = express();

app.configure(function() {
//	app.register('.html', require('ejs'));
	app.set('views', __dirname + '/views');
	app.set('view engine', 'html');
	app.set('view options', {layout: false});
	
	app.use( express.json());
//	app.use(express.bodyParser({uploadDir: __dirname + '/uploads'}));
	
	
//	app.use(express.cookieParser());
//	app.use(express.session({
//		secret: 'countlyss',
//		store: new mongoStore({db: sessionDb, collection: 'user_sessions'})
//	}));
//	app.use(express.methodOverride());
//	app.use(express.csrf());
	app.use(app.router);
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public'), { maxAge: oneYear });
});

app.configure('development', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});

app.get('/', function(req, res, next) {
	res.redirect('/login');
});

app.get('/query', function(req, res, next) {
	console.log("/query");
	
	sendReply(res,0,{});
});

app.post('/action', function(req, res, next) {
	console.log("/action");
	
	if(!req.body)  {
		sendReply(res,-1,{desc:'Invalid request.'});
        return;
    }        
      
    console.log(JSON.stringify(req.body));  
        
    countlyDb.collection('activities').update({ 'username':req.body.username} ,req.body, {upsert:true, safe:true} , function(err, result){
  //    countlyDb.collection('activities').save(req.body,  function(err, result){
      	if (!err){
      		sendReply(res,0,{});
      	}else{
      		console.log("Error upsert!"+err);
    		sendReply(res,-2,{});
      	}
    	
    });
    		
});

app.listen(port);

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



//=============================================================================
//Service definition: Query Service
//Description:
//	Query activity data inside the circle boundary of <lon,lat> , radius = distance.
//
//URL:
//	ROOT/query?lat=&lon=&distance=&p1=&p2=&device_id=&app_key=&ip_address
//Parameters:
//
//  <lat,lon>
//	distance: in meter.
//  p1:  1=Vehicles.  2=Passengers
//  p2:
//	device_id :
//	ip_address:
//	app_key:
//
//Response:
//	{ 'error' : error,
//    'data' : data     //contains array of event data.
//	};
//=============================================================================
function processQueryRequest(req, res, urlParts ) {
    var	queryString = urlParts.query;
	var getParams = {
					'app_key': queryString.app_key,
					'device_id': queryString.device_id,
					'ip_address': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
					
					'lat': queryString.lat,
					'lon': queryString.lon,
					'distance': queryString.distance,
					'p1': queryString.p1,
					'p2': queryString.p2,
				};
		
	console.log('processQueryRequest');
	
	console.log(JSON.stringify(getParams));
	
	fetchCollection( getParams, 'activities',res);
}





	