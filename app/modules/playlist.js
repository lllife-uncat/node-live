var models = require("./db").models;
var Base = models.Base;
var ObjectId = models.ObjectId;

function DevicePlaylist() {
    this.playlists = [];
    this.playlistItems = {};
}

function getPlaylist(serialNumber, callback) {

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

    function findPlaylists(deviceId, callback){
        var example = {
            entity: "Playlists",
            deviceIds: { $in: [deviceId.toString()] },
            publish: true
        };

        Base.findAllByExample(example, example.entity, function(success, playlists){
            if(success){
                console.log("[Find Playlists OK]");
                callback(playlists)
            }else {
                console.log("[Find Playlists Failed]");
                console.log(playlists);
                callback([]);
            }
        });
    }

    function queryDevicePlaylist(serialNumber, callback) {
        var dv = new DevicePlaylist();

        var example = {
            entity: "Devices",
            publish: true,
            serialNumber: serialNumber
        };

        // find device
        Base.findByExample(example, example.entity, function (success, returnDevice) {
            if (success && returnDevice) {
                var finish = false;
                var  device = returnDevice;
                findPlaylists(device._id, function(returnPlaylists){

                    var playlists = returnPlaylists;
                    playlists.forEach(function(returnPlaylist){

                        var playlist = returnPlaylist;
                        dv.playlists.push(playlist);

                        playlist.galleries.forEach(function(galleryElement){
                            findGallery(galleryElement.objectId, galleryElement.type, function(returnGallery){

                                var gallery = returnGallery;
                                gallery.objectIds.forEach(function(objectElement){
                                    var object = objectElement;
                                    var type = "Pictures";
                                    if(returnGallery.entity == "VideoGalleries") type = "Videos";


                                    findItem(object, type, function(item){
                                        console.log(item);
                                        if(item)
                                            dv.playlistItems[item._id] = item;
                                    });
                                });
                            });
                        });


                    });
                });

                while(!finish) {}
                callback(true, dv);
            } else {
                callback(false, null);
            }
        });
    }

    queryDevicePlaylist(serialNumber, callback);
}

exports.getPlaylists = getPlaylist;

