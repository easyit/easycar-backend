/**
 * Created with JetBrains WebStorm.
 * User: Deven
 * Date: 12-11-27
 * Time: 下午8:49
 * To change this template use File | Settings | File Templates.
 */


exports.index = function(req, res, next){
    //res.render('index', { title: 'Express' });
    res.redirect('/login');
};