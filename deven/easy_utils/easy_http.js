/**
 * Created with JetBrains WebStorm.
 * User: Deven
 * Date: 12-11-27
 * Time: 下午9:05
 * To change this template use File | Settings | File Templates.
 */

var http = require('http')
    , url = require('url')
    , path = require('path')
;



exports.validateRequest = function(req, res) {
    return true;
}


exports.sendReply = function(res, error, data){

    var result = { 'error' : error,  'data' : data };

    res.json(result);
}