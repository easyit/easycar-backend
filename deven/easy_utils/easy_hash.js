/**
 * Created with JetBrains WebStorm.
 * User: Deven
 * Date: 12-11-27
 * Time: 下午8:25
 * To change this template use File | Settings | File Templates.
 */

exports.sha1Hash = function(str, addSalt) {
    var salt = (addSalt)? new Date().getTime() : "";
    return crypto.createHmac('sha1', salt + "").update(str + "").digest('hex');
};