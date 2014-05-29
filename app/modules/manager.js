/**
* Database manaager.
* Not use....
*/
var mongojs = require("mongojs");
var configs = require("./setting").configs;
var connectionUri = configs.mongoUri;
var db = mongojs(connectionUri);

/**
* Class Manager.
*/
function Manager() {

  /**
  * Save entity object into database.
  * @param {Base} obj.
  * @param {function} callback
  */
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
