/**
 * Dependencies
 * @module mongojs
 * @module app/modules/setting
 */
var mongojs = require("mongojs");
var configs = require("./setting").configs;
var connectionUri = configs.mongoUri;
var db = mongojs(connectionUri);
var ObjectId = mongojs.ObjectId;


/**
* Append collection name with prefix.
* @param {String} collection name.
* @return {String} new collection name.
*/
function appendCollectionPrefix(entity) {
  return "Live" + entity;
}

/** Base
 * @property {date} createDate
 * @property {date} lastUpdate
 */
function Base() {
  this._id = null;
  this.createDate = new Date();
  this.lastUpdate = new Date();
  this.publish = true;

  // @param {Base} obj.
  // @param { function(success, data) } callback
  this.save = function (callback) {
    var collName = appendCollectionPrefix(this.entity);
    var collection = db.collection(collName);
    collection.save(this, function (err, success) {
      if (success) {
        console.log("[Update Success]");
        console.log(success);
        callback(true, success);
      } else {
        console.error("[Update DB Failed]");
        console.error(err);
        callback(false, err);
      }
    });
  };
}

/**
 * Static method
 * @param {string} id
 * @param {stirng} entity (collection name)
 * @callback {function(success,daa)} callaback
 */
Base.findById = function (id, entity, callback) {
  var collName = appendCollectionPrefix(entity);
  var collection = db.collection(collName);
  var condition = {
    _id: new ObjectId(id)
  };
  Base.findByExample(condition, entity, callback);
};

/**
 * findByExample
 * @param {* extends Base} example
 * @param {string} engity name
 * @param {function} callback
 */
Base.findByExample = function (example, entity, callback) {
  var collName = appendCollectionPrefix(entity);
  var collection = db.collection(collName);
  collection.findOne(example, function (err, document) {
    if (err) {
      console.error("[Find By Id Failed]");
      console.error(err);
      callback(false, err);
    } else {
      callback(true, document);
    }
  });
};

/**
* findAllByExample
* @param {Object extends Base} example
* @param {string} entity name
* @param {funcion} callback
 */
Base.findAllByExample = function (example, entity, callback) {
  var allow = Base.allow(entity);
  if (!allow) {
    callback(false, "Not allow");
    return;
  }

  var collName = appendCollectionPrefix(entity);
  var collection = db.collection(collName);

  collection.find(example, function (err, documents) {
    if (err) {
      console.error("[Find All by Example]");
      console.error(err);
      callback(false, err);
    } else {
      callback(true, documents);
    }
  });
};

/**
* Create object up to giving entity name.
* @return {Object} entity object.
*/
Base.create = function (entity) {
  var output = new Base();
  if (entity === "Devices") output = new Device();
  else if (entity === "Branchs") output = new Branch();
    else if (entity === "Videos") output = new Video();
      else if (entity === "Pictures") output = new Picture();
        else if (entity === "PictureGalleries") output = new PictureGallery();
          else if (entity === "VideoGalleries") output = new VideoGallery();
            else if (entity === "Playlists") output = new Playlist();
  return output;
};

/**
* Clone object properties from input to output.
* @param {Object} input
* @param {Object} output
* @return {Object} output
*/
Base.clone = function (input, output) {
  for (var key in output) {
    var value = input[key];
    //if (key == "entity") continue;
    if (key == "createDate") continue;
    if (key == "lastModify") continue;
    if (key == "_id" && value !== null) continue;

    if (key.indexOf("date") != -1) {
      output[key] = new Date(value);
    } else {
      if (output.hasOwnProperty(key) && input.hasOwnProperty(key)) {
        output[key] = input[key];
      }
    }
  }

  return output;
};

/**
* Check is given entity valid or not.
* @param {String} entity name.
* @return {Boolean}
*/
Base.allow = function (entity) {
  var allows = [
    "Devices",
    "Branchs",
    "Pictures",
    "Videos",
    "PictureGalleries",
    "VideoGalleries",
    "Playlists"
  ];
  if (allows.indexOf(entity) == -1) {
    return false;
  }
  return true;
};

/**
* Update exist object
* @param {Base} object
* @param {function} callback
*/
Base.update = function (object, callback) {

  // Get id
  // Get entity name
  // Check is entity valid
  var id = object._id;
  var entity = object.entity;
  if (!Base.allow(entity)) {
    callback(false, {
      message: "Not allow"
    });
    return;
  }

  // If id not present
  // * Save as new document
  // Else
  // * Update exist document
  if (!id) {
    var data = Base.create(object.entity);
    var realData = Base.clone(object, data);
    realData.save(callback);
  } else {
    Base.findById(id, entity, function (success, data) {
      if (success) {
        var newData = Base.clone(object, data);
        if (data) {
          newData.lastUpdate = new Date();
          new Base().save.call(newData, callback);
        } else {
          callback(false, {
            message: "Not found"
          });
        }
      } else {
        callback(false, data);
      }
    });
  }
};

/**
* Class Video extends Base, Picture.
* Prevent furture extension.
* @member {String} title
* @member {String} description
*/
function Video() {
  Base.apply(this, arguments);
  Picture.apply(this, arguments);

  this.entity = "Videos";
  Object.preventExtensions(this);
}

/**
* Picture extends Base
* Prevent extension
* @member {String} title
* @member {String} description
*/
function Picture() {
  this.title = "";
  this.description = "";
  this.originalName = "";
  this.contentType = "";
  this.size = 0;
  this.path = "";

  this.entity = "Pictures";
  Base.apply(this, arguments);
  Object.preventExtensions(this);
}

/**
* Branch extends Base
* Prevent extension
* @member {string} name
* @member {String} description
*/
function Branch() {
  this.branchId = "";
  this.name = "";
  this.description = "";
  this.deviceIds = [];

  this.entity = "Branchs";
  Base.apply(this, arguments);
  Object.preventExtensions(this);
}

/**
* Device extends Base
* Prevent extension
* @member {String} deviceId
* @member {String} serialNumber
*/
function Device() {
  this.deviceId = "";
  this.serialNumber = "";

  this.entity = "Devices";
  Base.apply(this, arguments);
  Object.preventExtensions(this);
}

/**
* Gallery extends Base
* Prevent extension
* @member {String} title
* @member {String} description
* @member {String} galleryType, available in GellertyType's property
*/
function PictureGallery() {
  this.title = "";
  this.description = "";
  this.objectIds = [];

  this.entity = "PictureGalleries";
  Base.apply(this, arguments);
  Object.preventExtensions(this);
}

/**
* VideoGallery extends Base
* Prevent extension
* @member {String} title
* @member {String} description
*/
function VideoGallery() {
  this.title = "";
  this.description = "";
  this.objectIds = [];

  this.entity = "VideoGalleries";
  Base.apply(this, arguments);
  Object.preventExtensions(this);
}

/**
* class Playlist extend Base
* @member {String} title
* @member {Array} galleries
* @member {Array} deviceIds
* @member {String} entity
*/
function Playlist() {
  this.title = "";
  this.galleries = [];
  this.deviceIds = [];
  this.entity = "Playlists";

  Base.apply(this, arguments);
  Object.preventExtensions(this);
}

/**
* Class GalleryDetail
* @member {String} title
* @member {String} objectId
* @member {String} play type.
*/
function GalleryDetail() {
  this.title = "";
  this.objectId = "";

  // Sequence / Random
  this.playing = "Sequence";
}

/*
* Export all entity class here.
* @member {Device}
* @member {Picture}
* @member {Video}
* @member {Branch}
* @member {PictureGallery}
* @member {VideoGallery}
*/
exports.models = {
  Base: Base,
  Device: Device,
  Picture: Picture,
  Video: Video,
  Branch: Branch,
  PictureGallery: PictureGallery,
  VideoGallery: VideoGallery,
  Playlist: Playlist,
  GalleryDetail: GalleryDetail,
  ObjectId: ObjectId
};
