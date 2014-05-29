var models = require("./modules/db").models;
var Base = models.Base;
var configs = require("./modules/setting").configs;
var utils = require("./modules/setting").utils;
var fs = require("fs");
var path = require("path");
var playlist = require("./modules/playlist");

module.exports = function (app) {

  /**
  * Get /
  * Web entry point
  * Send index.html from static folder
  */
  app.get("/", function (req, res) {
    res.sendfile("./public/views/index.html");
  });

  /**
  * Post /findById
  * Find document by id
  * @request body
  * { _id: "xxx", entity: "Names" }
  */
  app.post("/api/findById", function (req, res) {
    var body = req.body;
    var id = body._id;
    var entity = body.entity;

    Base.findById(id, entity, function (success, document) {
      if (!success) res.statusCode = 400;
      res.json(document);
    });

  });

  /** Post /findAllByExample
  * Find document by sample object
  * @request body
  * { entity: "Names", xx: "xx", yy: "yy" }
  */
  app.post("/api/findAllByExample", function (req, res) {

    // res.header('Access-Control-Allow-Origin', "*");
    // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    // res.header('Access-Control-Allow-Headers', 'Content-Type');

    var body = req.body;
    Base.findAllByExample(body, body.entity, function (success, documents) {
      if (!success) res.statusCode = 400;
      res.json(documents);
    });
  });

  app.post("/api/findById", function (req, res) {
    var body = req.body;
    var id = body._id;
    var entity = body.entity;
    Base.findById(id, entity, function (success, document) {
      if (!success) res.statusCode = 400;
      res.json(document);
    });
  });

  /**
  * Post /update
  * Insert/Update document
  * @request body
  * { entity: "Names", xx: "xx", yy: "yy" }
  */
  app.post("/api/update", function (req, res) {
    var entity = req.body;
    entity.lastUpdate = new Date();

    Base.update(entity, function (success, data) {
      if (!success) {
        res.statusCode = 400;
        console.log(data);
      }
      res.json(data);
    });
  });

  /**
  * Get video by id.
  * @param {String} uri.
  * @param {function} query hander.
  */
  app.get("/api/video/:id", function (req, res) {
    var _id = req.params.id;
    Base.findById(_id, "Videos", function (success, data) {
      if (!success) {
        res.statusCode = 400;
        res.json(data);
      } else {
        var videoPath = path.join(configs.uploadPath, data.path);

        try {
          var video = fs.readFileSync(videoPath);
          res.writeHead(200, {
            "Content-Type": data.contentType
          });
          res.end(video, "binary");
        } catch (e) {
          res.statusCode = 400;
          res.json(e);
        }
      }
    });
  });

  /**
  * Get picture by id.
  * @param {String} uri
  * @param {function} query hander.
  */
  app.get("/api/picture/:id", function (req, res) {
    var _id = req.params.id;
    Base.findById(_id, "Pictures", function (success, data) {
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

  /**
    * Append some file property.
    * @param {Object} file
    * @param {Object} output
    */
  function appendBasicInfo(file, output) {
    output.originalName = file.name;
    output.contentType = file.type;
    output.size = file.size;
    output.title = file.name;
  }

  /**
    * Upload video hander.
    * @param {String} uri
    * @param {function} hander.
    */
  app.post("/api/upload/video", function (req, res) {

    // Extract
    // - json property => req.file.body
    // - file object => req.files.file
    // - file name => req.files.file.name

    var body = req.body;
    var file = req.files.file;
    var fileName = file.name;

    // Create video path on server.
    var base = configs.uploadPath;
    var fullPath = utils.createPicturePath(base, "videos", fileName);
    var videoPath = fullPath.replace(base, "");

    // Create video object and append prefer properties.
    var video = new models.Video();
    video.path = videoPath;
    appendBasicInfo(file, video);

    // Read stream and write file into specific path.
    fs.readFile(file.path, function (err, data) {
      try {
        fs.writeFile(fullPath, data, function (err) {
          console.log(err);
        });
      } catch (e) {
        console.log(err);
        res.status = 40;
        res.json({
          message: "Read video failed"
        });
      }
    });

    video.save(function (success, data) {
      if (success) {
        res.json(data);
      } else {
        res.statusCode = 400;
        res.join(data);
      }
    });
  });


  /**
  * Upload picture heander.
  * @param {String} uri
  * @param {function} upload hander.
  */
  app.post("/api/upload/picture", function (req, res) {

    // Extract upload property.
    var body = req.body;
    var file = req.files.file;
    var fileName = file.name;
    var base = configs.uploadPath;
    var fullPath = utils.createPicturePath(base, "pictures", fileName);
    var picturePath = fullPath.replace(base, "");

    // Create Picture object and append properties.
    var picture = new models.Picture();
    picture.path = picturePath;
    appendBasicInfo(file, picture);

    // Write stream to specific path.
    fs.readFile(file.path, function (err, data) {
      fs.writeFile(fullPath, data, function (err) {
        console.log(err);
      });
    });

    // Update database.
    picture.save(function (success, data) {
      if (success) {
        res.json(data);
      } else {
        res.statusCode = 400;
        res.json(data);
      }
    });
  });

  /**
  * Get playlist information by device's serial number.
  * @param {String} uri
  * @param {function} request hander
  */
  app.get("/api/playlists/:serialNumber", function (req, res) {
    var sn = req.params.serialNumber;
    playlist.getDevicePlaylists(sn, function (success, playlists) {
      if (!success) {
        res.statusCode = 400;
        res.json({});
      } else {
        res.json(playlists);
      }
    });
  });
};
