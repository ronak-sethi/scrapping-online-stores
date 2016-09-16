/**
 created on 5/1/16
 */

var Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
   

var db_config = {
    host : '127.0.0.1',
    port : 27000,
    dbname : 'local',
    username : '',
    password : '',
    authRequired : false
}

var db = new Db(db_config.dbname,
    new Server(db_config.host, db_config.port,
    {
        auto_reconnect: true,
        poolSize: 1
    }),
{w: 1});

module.exports = {

    getDb: function () {

    //	if (db == null) {
        	
            db.open(function (err, client) {

                if (db_config.authRequired) {
                    db.authenticate(db_config.username, db_config.password, function (err, result) {
                        console.log('err=' + err);
                        if (err) {
                            //throw err;

                            var obj = {};
                            obj.code = err.appCode;
                            obj.data = err;
                            util.sendResponse(res, obj);

                        } else {
                            console.log('Mongo DB authentication successful....');
                        }
                    });
                }
            });
    //    }
            return db;
    },
};



