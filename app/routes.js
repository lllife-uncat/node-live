var models = require("./modules/db").models;
var Base = models.Base;
var configs = require("./modules/setting").configs;
var utils = require("./modules/setting").utils;
var fs = require("fs");
var path = require("path");

module.exports = function(app) {

    // Get /
    // * Web entry point
    // * Send index.html from static folder
    app.get("/", function(req, res) {
        res.sendfile("./public/views/index.html");
    });

    // Post /findById
    // * Find document by id
    // @request body
    // { _id: "xxx", entity: "Names" }
    app.post("/api/findById", function(req, res) {
        var body = req.body;
        var id = body._id;
        var entity = body.entity;

        Base.findById(id, entity, function(success, document) {
            if (!success) res.statusCode = 400;
            res.json(document);
        });

    });

    // Post /findAllByExample
    // * Find document by sample object
    // @request body
    // { entity: "Names", xx: "xx", yy: "yy" }
    app.post("/api/findAllByExample", function(req, res) {
        var body = req.body;
        Base.findAllByExample(body, body.entity, function(success, documents) {
            if (!success) res.statusCode = 400;
            res.json(documents);
        });
    });

    app.post("/api/findById", function(req, res) {
        var body = req.body;
        var id = body._id;
        var entity = body.entity;
        Base.findById(id, entity, function(success, document) {
            if (!success) res.statusCode = 400;
            res.json(document);
        });
    });

    // Post /update
    // * Insert/Update document
    // @request body
    // { entity: "Names", xx: "xx", yy: "yy" }
    app.post("/api/update", function(req, res) {
        var entity = req.body;
        entity.lastUpdate = new Date();

        Base.update(entity, function(success, data) {
            if (!success) res.statusCode = 400;
            res.json(data);
        });
    });

    app.get("/api/picture/:id", function(req, res) {
        var _id = req.params.id;
        Base.findById(_id, "Pictures", function(success, data) {
            if (!success) {
                res.statusCode = 400;
                res.json(data);
            } else {
                var image = path.join(configs.uploadPath, data.path);
                var img = fs.readFileSync(image);
                res.writeHead(200, {
                    "Content-Type": data.contentType
                });
                res.end(img, "binary");
            }
        });
    });

    app.post("/api/upload", function(req, res) {

        var body = req.body;
        var file = req.files.file;
        var fileName = file.name;
        var base = configs.uploadPath;
        var fullPath = utils.createPicturePath(base, fileName);
        var picturePath = fullPath.replace(base, "");

        var picture = new models.Picture();
        //picture.title = body.title;
        //picture.description = body.description;
        picture.path = picturePath;
        picture.originalName = fileName;
        picture.contentType = file.type;
        picture.size = file.size;

        fs.readFile(file.path, function(err, data) {
            fs.writeFile(fullPath, data, function(err) {
                console.log(err);
            });
        });

        picture.save(function(success, data) {
            if (success) {
                res.json(data);
            } else {
                res.statusCode = 400;
                res.json(data);
            }
        });
    });
};
