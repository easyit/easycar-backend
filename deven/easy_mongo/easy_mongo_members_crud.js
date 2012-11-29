/**
 * Created with JetBrains WebStorm.
 * User: Deven
 * Date: 12-11-27
 * Time: 下午8:42
 * To change this template use File | Settings | File Templates.
 */

var easy_utils_http = require('../easy_utils/easy_http.js')
;


exports.createUser = function(httpResponse, newUser) {

    countlyDb.collection('members').insert( newUser, {safe: true},
        function(err, user) {
            var result = { 'error' : 1};

            if (user && !err) {
                easy_utils_http.sendReply(httpResponse, 0, user[0]);
            } else {
                easy_utils_http.sendReply(httpResponse, -1, {});
            }
        }
    );
}