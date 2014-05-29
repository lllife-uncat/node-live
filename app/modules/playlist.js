/**
* Require "db" module for persist data into database.
*/
var models = require("./db").models;
var Base = models.Base;
var ObjectId = models.ObjectId;

/**
* Class DevicePlaylist
* @member {Array} playlists
* @member {Array} galleryDetails
* @member {Array} galleryItems
*/
function DevicePlaylist() {
  this.playlists = [];
  this.galleryDetails = {};
  this.galleryItems = {};
}

/**
* Get DevicePlaylist by device's serail number.
* @param {String} serial number.
* @param {function} callback.
*/
function getDevicePlaylists(serialNumber, callback) {

  /**
  * Find gallery item upto given type.
  * Geven type can be "Video" or "Picture".
  * @param {String} id: item id.
  * @param {String} type: item type (Video/Picture)
  * @param {fucntion} callback: callback function.
  */
  function findItem(id, type, callback){
    var example = {
      entity: type,
      _id: new ObjectId(id)
    };

    console.log("[Find Item]");
    console.log(example);

    Base.findByExample(example, example.entity, function(success, data){
      if(success){
        console.log("[Find Video/Picture OK]");
        callback(data);
      }else {
        console.log("[Find Video/Picture Failed]");
        callback(null);
      }
    });
  }

  /**
  * Find gallery up to given type.
  * Given type can be "VideoGalleries" or "PictureGalleries".
  * @param {String} id: gallery id.
  * @param {String} type: gallery type (VideoGalleries/PictureGalleries)
  * @param {Function} callback.
  */
  function findGallery(id, type, callback) {
    var example = {
      entity: type,
      _id: new ObjectId(id)
    };

    Base.findByExample(example, example.entity, function(success, data){
      if(success) {
        console.log("[Find Gallery OK]");
        callback(data);
      }else {
        console.log("[Find Gallery Failed]");
        console.log(data);
        callback(null);
      }
    });
  }

  /**
  * Find all playlist match device's serial number.
  * @param {String} devices' serial number.
  * @param {function} callback.
  */
  function findPlaylists(deviceId, callback){
    var example = {
      entity: "Playlists",
      deviceIds: { $in: [deviceId.toString()] },
      publish: true
    };

    Base.findAllByExample(example, example.entity, function(success, playlists){
      if(success){
        console.log("[Find Playlists OK]");
        callback(playlists);
      }else {
        console.log("[Find Playlists Failed]");
        console.log(playlists);
        callback([]);
      }
    });
  }

  /**
  * Find all Playlist match device's serail number.
  * @param {String} serialNUmber: device's serial number.
  * @param {Function} callback.
  */
  function queryDevicePlaylist(serialNumber, callback) {

    var dv = new DevicePlaylist();

    // Query conditions.
    // Prefer all publish device and match given serial number.
    var example = {
      entity: "Devices",
      publish: true,
      serialNumber: serialNumber
    };

    // Find playlist by given example.
    // - entity: "Devices"
    // - publish: true
    // - serialNumber: <function args>
    Base.findByExample(example, example.entity, function (success, returnDevice) {

      if (success && returnDevice) {

        // Find all playlist match device's serial number.
        findPlaylists(returnDevice._id, function(returnPlaylists){

          // Treveral over play list and find play list detail.
          returnPlaylists.forEach(function(returnPlaylist){

            // Delete deviceIds property from object (don't need on client).
            delete returnPlaylist.deviceIds;
            dv.playlists.push(returnPlaylist);

            // Treversal over gelleries and find gellery detail.
            returnPlaylist.galleries.forEach(function(galleryElement){

              // Find gallery detail.
              findGallery(galleryElement.objectId, galleryElement.type, function(returnGallery){

                // Append gallery id and detail into result object.
                dv.galleryDetails[returnGallery._id] = returnGallery;

                // Find item under gallery.
                returnGallery.objectIds.forEach(function(objectElement){

                  // Check item type.
                  var type = "Pictures";
                  if(returnGallery.entity == "VideoGalleries") type = "Videos";

                  // Generate item information.
                  findItem(objectElement, type, function(item){
                    console.log(item);

                    // Generate item url for image and video.
                    if(item) {
                      var url = "/api/picture/" + item._id;
                      if(item.entity == "Videos") {
                        url = "/api/video/" + item._id;
                      }

                      // Delete server path (don't need on client).
                      delete item.path;

                      // Append item url for download.
                      item.url = url;

                      // Append item id and detail into result object.
                      dv.galleryItems[item._id] = item;
                    }  // end if
                  }); // end find item
                }); // end returnGallery.forEach
              }); // end findGallery
            }); // end returnGallery.forEach
          }); // end returnPlaylist.forEach
        }); // end findPlaylist

        // Dont' find a correct way to return with this asynchronize query.
        // Just fix timeout and return declair object.
        setTimeout(function() {
          callback(true, dv);
        }, 2000);

      } else {
        callback(false, null);
      }
    });
  }

  // Start query information here.
  queryDevicePlaylist(serialNumber, callback);
}

// Export function here.
exports.getDevicePlaylists = getDevicePlaylists;
