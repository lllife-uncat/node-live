var models = require("./modules/db").models;
var Base = models.Base;

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
    app.post("/findById", function(req, res) {
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
    app.post("/findAllByExample", function(req, res) {
        var body = req.body;
        Base.findAllByExample(body, body.entity, function(success, documents) {
            if (!success) res.statusCode = 400;
            res.json(documents);
        });
    });

    // Post /update
    // * Insert/Update document
    // @request body
    // { entity: "Names", xx: "xx", yy: "yy" }
    app.post("/update", function(req, res) {
        var object = req.body;
        var entity = object.entity;
        object.lastUpdate = new Date();

        Base.update(object, function(success, data) {
            if (!success) res.statusCode = 400;
            res.json(data);
        });
    });
};
