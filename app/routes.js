var models = require("./modules/db").models;
var Base = models.Base;

module.exports = function(app) {

    app.get("/", function(req, res) {
        res.sendfile("./public/views/index.html");
    });

    app.post("/findById", function(req, res) {
      var body = req.body;
      var id = body._id;
      var entity = body.entity;

      Base.findById(id, entity, function(success, document) {
        if(!success) res.statusCode = 400;
        res.json(document);
      });

    });

    app.post("/findAllByExample", function(req, res) {
      var body = req.body;
      Base.findAllByExample(body, body.entity, function(success, documents){
        if(!success) res.statusCode = 400;
        res.json(documents);
      });
    });

    app.post("/update", function(req, res) {
      var object = req.body;
      var entity = body.entity;
      object.lastUpdate = new Date();



    });
};
