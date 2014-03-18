var moment = require("moment");
var path = require("path");
var fs = require("fs");
var mkdirp = require("mkdirp");

function Setting() {
    this.mongoUri = "mongodb://localhost/Live";
    this.uploadPath = "/home/recovery/uploads";
}

function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// create picture path
// @params {string} base
// @params {string} fileName
function createPicturePath(base, fileName) {
    var time = moment().format("YYYY/MM/DD");
    var uuid = createUUID();
    var dir = path.join(base, time);

    var exists = fs.existsSync(dir);
    if(!exists) {
      mkdirp.sync(dir);
    }

    var fullPath = path.join(dir, uuid);
    var filePart = fileName.split(".");
    var extension = filePart[filePart.length -1];

    return fullPath + "." + extension;
}

exports.configs = new Setting();
exports.utils = {
    createPicturePath: createPicturePath
};
