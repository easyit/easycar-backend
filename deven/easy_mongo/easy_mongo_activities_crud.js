/**
 * Created with JetBrains WebStorm.
 * User: Deven
 * Date: 12-11-27
 * Time: 下午10:30
 * To change this template use File | Settings | File Templates.
 */

var easy_utils_gps = require('../easy_utils/easy_gps_calc.js')
    ;

exports.find_by_distance = function(db, locationPoint, maxDistanceByKM, callback){

    /*
    db.collection('activities').find({ location : { $near : [120,30] , $maxDistance : 5 } }, function (err, member) {
        if (member || err) {
            sendReply(res, -2, {});
            return false;
        } else {
            createUser(res, getParams);
        }
    });
    */

    var maxDistanceByRadian = easy_utils_gps.calcRadianByArcLength(maxDistanceByKM)

    console.log("DistanceByKM: " + maxDistanceByKM);
    console.log("DistanceByRadian: " + maxDistanceByRadian);

    db.collection('activities').findItems(
        { location : { $near : locationPoint, $maxDistance : maxDistanceByRadian } },
        function(err, array) {
            callback(err, array);

            /*
            if(err) {
                easy_utils_http.sendReply(httpResponse, -2, {});
                return false;
            }

            if(array) {

                var result = new Array();
                array.forEach(function(item){
                    db.dereference(item.dbref_role,function(err,doc){
                        result.push(doc);
                        if(result.length == array.length){
                            res.render('index',{a:result});
                        }
                    });
                });

                console.log(JSON.stringify(array));
                easy_utils_http.sendReply(httpResponse, 0, array);
                return true;

            console.log("[activities_find_by_distance] Nothing found!");
            easy_utils_http.sendReply(httpResponse, -1, array);
            return false;
            */
    } );

};