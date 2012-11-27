/**
 * Created with JetBrains WebStorm.
 * User: Deven
 * Date: 12-11-27
 * Time: 下午8:10
 * To change this template use File | Settings | File Templates.
 */


/**
 * Module dependencies. **************************************************
 */

var express = require('express')
    , http = require('http')
    , url = require('url')
    , path = require('path')
    , mongo = require('mongoskin')
    ;

/**
 * Folder dependencies. **************************************************
 */

var countlyConfig = require('./config')
    //, easy_mongo = require('./easy_mongo')
    //, easy_routes = require('./easy_routes')
    , easy_utils_hash = require('./easy_utils/easy_hash.js')
    , easy_utils_http = require('./easy_utils/easy_http.js')
;

/**
 * Config dependencies. **************************************************
 */

var hostIp = countlyConfig.mongodb.host
    , hostHttpPort = countlyConfig.api.port
    , hostDbPort = countlyConfig.mongodb.port
    , countlyDb = mongo.db(hostIp + ':' + hostDbPort + '/'
        + countlyConfig.mongodb.db + '?auto_reconnect')
;


/**
 * Application configuration. ********************************************
 */


var app = express();

app.configure(function(){
    //app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    //app.set('view engine', 'ejs');
    app.set('view engine', 'html');
    app.set('view options', {layout: false});

    app.use(express.json());
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);

    //app.use(express.static(path.join(__dirname, 'public')));
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public'), { maxAge: oneYear });
});


app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

/**
 * HTTP Routes. **********************************************************
 */

//app.get('/', easy_routes.index);
//app.get('/users', user.list);

app.get('/', function(req, res, next) {
    res.redirect('/login');
});

app.get('/query', function(req, res, next) {
    console.log("/query");

    easy_utils_http.sendReply(res, 0, {});
});


//app.post('/action', function(req, res, next) {
app.get('/action', function(req, res, next) {
    console.log("/action");

    if(!req.body)  {
        easy_utils_http.sendReply(res, -1, {desc:'Invalid request.'});
        return;
    }

    console.log(JSON.stringify(req.body));

    /*

    //countlyDb.collection('activities').save(req.body, function(err, result){
    countlyDb.collection('activities').update(
        {'username':req.body.username},
        req.body,
        {upsert:true, safe:true},
        function(err, result) {
            if (!err){
                easy_utils_http.sendReply(res, 0, {});
            }else{
                console.log("Error upsert!"+err);
                easy_utils_http.sendReply(res, -2, {});
            }
    });
    */

    var locPoint = [120,30];
    var maxDistance = 5;

    //countlyDb.collection('activities').findItems( { location : { $near : [120,30] , $maxDistance : 5 } }, function(err, array) {
    countlyDb.collection('activities').findItems(
        { location : { $near : locPoint , $maxDistance : maxDistance } },
        function(err, array) {

        /*
         if(err) {
         easy_utils_http.sendReply(res, -2, {});
         return false;
         }
         */

        if(array) {
            /*
             var result = new Array();
             array.forEach(function(item){
             db.dereference(item.dbref_role,function(err,doc){
             result.push(doc);
             if(result.length == array.length){
             res.render('index',{a:result});
             }
             });
             });
             */
            console.log(JSON.stringify(array));
            easy_utils_http.sendReply(res, 0, array);
            return;
        }

        console.log("[activities_find_by_distance] Nothing found!");
        easy_utils_http.sendReply(res, -1, array);
    } );
});

/**
 * HTTP Startup. **********************************************************
 */

/*
 http.createServer(app).listen(app.get('port'), function(){
 console.log("Express server listening on port " + app.get('port'));
 });
 */

app.listen(hostHttpPort);


/**
 * DB Manipulations. **********************************************************
 */

var fetchCollection = function (getParams, collection, res) {
    countlyDb.collection(collection).find({}).toArray(function (err, result) {
        if (!result.length) {
            result = {};
        }

        console.log(result);

        if (getParams.callback) {
            result = getParams.callback + "(" + JSON.stringify(result) + ")";
        } else {
            result = JSON.stringify(result);
        }

        res.writeHead(200, {'Content-Type':'application/json'});
        res.write(result);
        res.end();
    });
}


function createUser(res, newUser) {
    countlyDb.collection('members').insert(newUser, {safe:true}, function (err, user) {
        var result = { 'error':1};

        if (user && !err) {
            easy_utils_http.sendReply(res, 0, user[0]);
        } else {
            easy_utils_http.sendReply(res, -1, {});
        }
    });
}


function processUserCreation(req, res, urlParts) {
    var queryString = urlParts.query;
    var getParams = {
        'device_id':queryString.device,
        'username':queryString.username,
        'email':queryString.email,
        'phone':queryString.phone,
    };

    countlyDb.collection('members').findOne({ $or:[
        {email:getParams.email},
        {username:getParams.username}
    ] }, function (err, member) {
        if (member || err) {
            sendReply(res, -2, {});
            return false;
        } else {
            createUser(res, getParams);
        }
    });

}


function processQueryRequest(req, res, urlParts) {
    var queryString = urlParts.query;
    var getParams = {
        'app_key':queryString.app_key,
        'device_id':queryString.device_id,
        'ip_address':req.headers['x-forwarded-for'] || req.connection.remoteAddress,

        'lat':queryString.lat,
        'lon':queryString.lon,
        'distance':queryString.distance,
        'p1':queryString.p1,
        'p2':queryString.p2,
    };

    console.log('processQueryRequest');

    console.log(JSON.stringify(getParams));

    fetchCollection(getParams, 'activities', res);
}
