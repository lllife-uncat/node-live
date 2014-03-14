// Dependencies
// @module mongojs
// @module app/modules/setting
var mongojs = require("mongojs");
var configs = require("./setting").configs;
var connectionUri = configs.mongoUri;
var db = mongojs(connectionUri);
var ObjectId = mongojs.ObjectId;

// Base
// @property {date} createDate
// @property {date} lastUpdate
function Base() {
    this.createDate = new Date();
    this.lastUpdate = new Date();
    Object.preventExtensions(this);
}

// save
// @params {Base} obj.
// @params { function(success, data) } callback
Base.prototype.save = function(callback) {

    console.log("[Save]");
    console.log(this);

    var obj = this;
    var collection = db.collection(obj.entity);
    collection.save(obj, function(err, success) {
        if (success) {
            callback(true, success);
        } else {
            console.error("[Update DB Failed]");
            console.error(err);
            callback(false, err);
        }
    });
};


// Static method
// @params {string} id
// @params {stirng} entity (collection name)
// @callback {function(success,daa)} callaback
Base.findById = function(id, entity, callback) {
    var collection = db.collection(entity);
    var condition = {
        _id: new ObjectId(id)
    };
    Base.findByExample(condition, entity, callback);
};

Base.findByExample = function(example, entity, callback) {
    var collection = db.collection(entity);
    collection.findOne(example, function(err, document) {
        if (err) {
            console.error("[Find By Id Failed]");
            console.error(err);
            callback(false, err);
        } else {
            callback(true, document);
        }
    });
};

Base.findAllByExample = function(example, entity, callback) {
    var collection = db.collection(entity);
    collection.find(example, function(err, documents) {
        if (err) {
            callback(false, err);
        } else {
            callback(true, documents);
        }
    });
};

// Update exist object
// @params {Base} object
// @params {function} callback
Base.update = function(object, callback) {

    var id = object._id;
    var entity = object.entity;

    Base.findById(id, entity, function(success, data) {

        if (success) {

            console.log("[Query Update]");
            console.log(data);

            for (var key in data) {
                var value = data[key];

                console.log("[Key Value]");
                console.log(key);
                console.log(value);

                if (key == "entity") continue;
                if (key == "createDate") continue;
                if (key == "lastModify") continue;

                if (key.indexOf("date") != -1) {
                    data[key] = new Date(value);
                } else {
                    if (object.hasOwnProperty(key) && data.hasOwnProperty(key)) {
                        data[key] = object[key];
                    }
                }
            }

            data.lastUpdate = new Date();
            Base.prototype.save.call(data, callback);

        } else {
            callback(false, data);
        }
    });
};

// Video
// @property {string} title
// @property {string} description
function Video() {
    this.title = "";
    this.description = "";

    this.entity = "Videos";
    Base.apply(this, arguments);
    Object.preventExtensions(this);
}

// Picture
// @property {string} title
// @property {string} description
function Picture() {
    this.title = "";
    this.description = "";

    this.entity = "Pictures";
    Base.apply(this, arguments);
    Object.preventExtensions(this);
}

// Branch
// @property {string} name
// @property {string} description
function Branch() {
    this.name = "";
    this.description = "";
    this.deviceIds = [];

    this.entity = "Branchs";
    Base.apply(this, arguments);
    Object.preventExtensions(this);
}

// Device
// @property {string} deviceId
// @property {string} serialNumber
function Device() {
    this.deviceId = "";
    this.serialNumber = "";
    this.pictureGalleryIds = [];
    this.videoGalleryIds = [];

    this.entity = "Devices";
    Base.apply(this, arguments);
    Object.preventExtensions(this);
}

// Gallery
// @property {string} title
// @property {string} description
// @property {string} galleryType, available in GellertyType's property
function PictureGallery() {
    this.title = "";
    this.description = "";
    this.objectIds = [];

    this.entity = "ImageGalleries";
    Base.apply(this, arguments);
    Object.preventExtensions(this);
}


// VideoGallery
// @property {string} title
// @property {string} description
function VideoGallery() {
    this.title = "";
    this.description = "";
    this.objectIds = [];

    this.entity = "VideoGalleries";
    Base.apply(this, arguments);
    Object.preventExtensions(this);
}

// models
// @property {Device}
// @property {Picture}
// @property {Video}
// @property {Branch}
// @property {PictureGallery}
// @property {VideoGallery}
exports.models = {
    Base: Base,
    Device: Device,
    Picture: Picture,
    Video: Video,
    Branch: Branch,
    PictureGallery: PictureGallery,
    VideoGallery: VideoGallery
};
