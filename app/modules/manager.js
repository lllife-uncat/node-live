var mongojs = require("mongojs");
var configs = require("./setting").configs;
var connectionUri = configs.mongoUri;
var db = mongojs(connectionUri);

function Manager() {

  // save
  // @params {Base} obj.
  // @params { function(success, data) } callback
  function save(obj , callback){
      var collection = db.collection(obj.entityName);
      collection.save(obj, function(err, rs) {
        if(success) {
          callback(true, rs);
        }else {
          callback(false, err);
        }
      });
    }
}
