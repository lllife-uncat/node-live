models = require("./db").models;
var Base = models.Base;
var ObjectId = models.ObjectId;

function DevicePlaylist() {
    this.playlists = [];
    this.galleryDetails = {};
    this.galleryItems = {};
}

function getDevicePlaylists2(serialNumber, number, callback) {

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
                if(playlists.length >= number){
                    var arr = [playlists[number -1]];
                    callback(arr);
                }else{
                    callback([]);
                }
                
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

        // Find playlist by given example
        // - entity: "Devices"
        // - publish: true
        // - serialNumber: <function args>
        Base.findByExample(example, example.entity, function (success, returnDevice) {

            //
            if (success && returnDevice) {

                findPlaylists(returnDevice._id, function(returnPlaylists){

                    returnPlaylists.forEach(function(returnPlaylist){

                        delete returnPlaylist.deviceIds;
                        dv.playlists.push(returnPlaylist);
                        returnPlaylist.galleries.forEach(function(galleryElement){

                            findGallery(galleryElement.objectId, galleryElement.type, function(returnGallery){

                                dv.galleryDetails[returnGallery._id] = returnGallery;

                                returnGallery.objectIds.forEach(function(objectElement){

                                    var type = "Pictures";
                                    if(returnGallery.entity == "VideoGalleries") type = "Videos";

                                    findItem(objectElement, type, function(item){
                                        console.log(item);
                                        if(item) {
                                            var url = "/api/picture/" + item._id;
                                            if(item.entity == "Videos") {
                                               url = "/api/video/" + item._id;
                                            }

                                            delete item.path;
                                            item.url = url;

                                            dv.galleryItems[item._id] = item;
                                        }
                                    });
                                });
                            });
                        });
                    });
                });

                setTimeout(function() {
                    callback(true, dv);
                }, 2000);

            } else {
                callback(false, null);
            }
        });
    }
    queryDevicePlaylist(serialNumber, callback);
}

exports.getDevicePlaylists2 = getDevicePlaylists2;

