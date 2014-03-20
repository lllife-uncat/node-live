var app = angular.module("liveApplication", [ "ngRoute", "angularFileUpload", "ui.sortable" ]);

app.config(function($routeProvider){
    $routeProvider.when('/', {
        templateUrl: 'views/home.html',
        controller: "HomeController"
    });

    $routeProvider.when("/home", {
        templateUrl: "views/home.html",
        controller: "HomeController"
    });

    $routeProvider.when("/upload", {
        templateUrl: "views/upload.html",
        controller: "UploadController"
    });

    $routeProvider.when("/branch", {
        templateUrl: "views/branch.html",
        controller: "BranchController"
    });

    $routeProvider.when("/video", {
        templateUrl : "views/video.html",
        controller: "VideoController"
    });

    $routeProvider.when("/picture", {
        templateUrl : "views/picture.html",
        controller: "PictureController"
    });

    $routeProvider.when("/playlist", {
        templateUrl: "views/playlist.html",
        controller: "PlaylistController"
    });

    $routeProvider.otherwise({ redirect: "/"});
});




app.factory("globalService", function ($http) {

    // Update
    // @params {extends Base} entity
    // @params {function} callback
    function update(entity, callback) {
        var url = "/api/update";
        var request = $http({
            url: url,
            data: JSON.stringify(entity),
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        request.success(function (data, status) {
            callback(true, data);
        });

        request.error(function (data, status) {
            callback(false, data);
        });
    }

    function findById(id, entity, callback){
        var url = "/api/findById";
        var request = $http({
           url: url,
            data: JSON.stringify({ _id: id, entity: entity}),
            method: "POST",
            headers: { "Content-Type" : "application/json" }
        });

        request.success(function(data, status){
           callback(true, data);
        });

        request.error(function(data, status){
           callback(false, data);
        });
    }

    function findAllByExample(example, callback) {
        var url = "/api/findAllByExample";
        var request = $http ({
            url: url,
            data: JSON.stringify(example),
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        request.success(function(data,status) {
           callback(true, data);
        });

        request.error(function(data, status){
            callback(true, data);
        });
    }

    return {
        update: update,
        findAllByExample: findAllByExample,
        findById: findById
    };
});
app.factory("models", function () {

    function Branch() {
        this.entity = "Branchs";
        this.branchId = "";
        this.name = "";
        this.deviceIds = [];
        this.description = "";
    }

    function Device() {
        this.entity = "Devices";
        this.deviceId = "";
        this.serialNumber = "";
    }

    function Picture() {
        this.title = "";
        this.description = "";
        this.entity = "Picutres";
        this.publish = true;
    }

    function PictureGallery() {
        this.title = "";
        this.description = "";
        this.objectIds = [];
        this.entity = "PictureGalleries";
        this.publish = true;
        this.$pictures = [];
    }

    function VideoGallery() {
        this.title = "";
        this.description = "";
        this.objectIds = [];
        this.entity = "VideoGalleries";
        this.$videos = [];
    }

    function GalleryDetail() {
        this.type = "Videos";
        this.objectId = "";
    }

    function Playlist() {
        this.title = "";
        this.deviceIds = [];
        this.galleries = [];
        this.$galleries = [];
        this.entity = "Playlists";
    }

    return {
        Branch: Branch,
        Device: Device,
        Picture: Picture,
        PictureGallery: PictureGallery,
        VideoGallery: VideoGallery,
        Playlist: Playlist,
        GalleryDetail: GalleryDetail
    };
});
app.factory("uiService", function () {

    function Dialog(id) {

        this.id = id;

        this.show = function () {
            $(this.id).modal().modal("show");
        };

        this.close = function() {
            $(this.id).modal("hide");
        };
    }

    return {
        Dialog: Dialog
    };
});
app.controller("BranchController", function($scope, models, globalService) {

    function updateCallback(success, data) {
        if(success) {
            if(!$scope.currentBranch._id) {
                $scope.branchs.push(data);
            }
            $scope.currentBranch = new models.Branch();
        }
    }

    function findAllByExampleCallback(success, data) {
        if(success) {
            $scope.branchs = data;
            if($scope.branchs.length > 0){
                $scope.currentBranch = $scope.branchs[0];
            }
        }
    }

    angular.element(document).ready(function(){
        var example = { entity: "Branchs", publish: true };
        globalService.findAllByExample(example, findAllByExampleCallback);

        globalService.findAllByExample( { entity: "Devices", publish: true }, function(success, data){
            if(success && data){
                $scope.devices = data;
            }
        });

        globalService.findAllByExample( { entity: "Playlists", publish: true }, function(success, data){
           if(success && data) {
               $scope.playlists = data;
           }
        });
    });

    $scope.currentBranch = new models.Branch();
    $scope.currentDevice = new models.Device();
    $scope.branchs = [];
    $scope.devices = [];
    $scope.editMode = false;

    $scope.playlists = [];

    $scope.toggleMode = function() {
        $scope.editMode = !$scope.editMode;
    };

    $scope.removeBranch = function(branch){
        branch.publish = false;
        globalService.update(branch, function(success, data){
           if(success){
               var index = $scope.branchs.indexOf(branch);
               $scope.branchs.splice(index,1);
           }
        });
    };

    $scope.getPlaylists = function(id){
//        var id = device._id;
        var playlist = _.filter($scope.playlists, function(pl){
            return pl.deviceIds.indexOf(id) !== -1;
        });

        console.log(playlist);

        return playlist;
    };


    $scope.addDevice = function(device) {
       globalService.update($scope.currentDevice, function(success, data){
           if(success) {
               if(device._id){

               }
               else {
                   $scope.devices.push(data);
                   $scope.currentBranch.deviceIds.push(data._id);
               }

               $scope.currentDevice = new models.Device();
           }
       });
    };


    $scope.editDevice = function(deviceId){
        var device = $scope.getDevice(deviceId);
        $scope.currentDevice = device;
    };

    $scope.getDevice = function(deviceId) {
        var device = _.findWhere($scope.devices, { _id: deviceId});
        return device;
    };

    $scope.removeDevice = function(deviceId){
        var branch = $scope.currentBranch;
        console.log(branch);
        var index = branch.deviceIds.indexOf(deviceId);
        if(index !== -1){
            branch.deviceIds.splice(index,1);
        }
    };

    $scope.addBranch = function(){
        $scope.editMode = true;
        $scope.currentBranch = new models.Branch();
    };

    $scope.editBranch = function(branch){
        $scope.editMode = true;
        $scope.currentBranch = branch;
    };

    $scope.save = function(entity) {
        console.log("[saving]");
        console.log(entity);

        globalService.update(entity, updateCallback);
    };

    $scope.selectBranch = function(branch){
        $scope.currentBranch = branch;
    };

    $scope.isSelected = function(branch){
        return branch === $scope.currentBranch;
    };
});
app.controller("HomeController", function ($scope ) {

    angular.element(document).ready(function () {

    });
});


app.controller("MainController", function($scope){

});
app.controller("PictureController", function ($scope, globalService, models, $upload, $timeout) {

    angular.element(document).ready(function () {
        // Get all gallery
        // Find all picture under each gallery
        // Keep reference in .$pictures
        var example = { publish: true, entity: "PictureGalleries" };
        globalService.findAllByExample(example, function (success, data) {
            if (success) {
                $scope.galleries = data;
                $scope.galleries.forEach(function (g) {
                   resolvePictures(g);
                });
            }

            if($scope.galleries.length > 0){
                $scope.currentGallery = $scope.galleries[0];
            }
        });
    });

    function resolvePictures(g) {
        g.$pictures = [];
        g.objectIds.forEach(function (id) {
            globalService.findById(id, "Pictures", function (success, data) {
                if (success && data) {
                    g.$pictures.push(data);
                }
            });
        });
    }

    $scope.galleries = [];
    $scope.currentGallery = new models.PictureGallery();
    $scope.currentPicture = new models.Picture();
    $scope.editMode = false;

    $scope.addGallery = function () {
        $scope.editMode = true;
        $scope.currentGallery = new models.PictureGallery();
    };

    $scope.isSelected = function (gallery) {
        return $scope.currentGallery === gallery;
    };

    $scope.selectPicture = function(picture){
        $scope.currentPicture = picture;
    };

    $scope.removePicture = function(picture){
        picture.publish = false;
        $timeout(function(){
            var index = $scope.currentGallery.$pictures.indexOf(picture);
            $scope.currentGallery.$pictures.splice(index,1);
            $scope.currentPicture = null;
        }, 100);
    };

    $scope.isSelectedPicture = function(picture){
        var match =  picture === $scope.currentPicture;

        return match;
    };

    $scope.selectGallery = function (gallery) {
        $scope.curerntGallery = gallery;
    };

    $scope.editGallery = function (gallery) {
        $scope.editMode = true;
        $scope.currentGallery = gallery;
    };

    $scope.removeGallery = function (gallery) {
        gallery.publish = false;
        $timeout(function () {
            globalService.update(gallery, function (success, data) {
                if (success) {
                    var index = $scope.galleries.indexOf(gallery);
                    $scope.galleries.splice(index, 1);
                }
            });
        }, 600);
    };

    $scope.toggleMode = function () {
        $scope.editMode = !$scope.editMode;
    };

    $scope.saveGallery = function (gallery) {
        // Check is $pictures already in objectIds.
        // Call update method in global service.
        // If OK
        // * Create new gallery instance.
        gallery.objectIds = [];
        gallery.$pictures.forEach(function (pic) {
            gallery.objectIds.push(pic._id);
        });

        globalService.update(gallery, function (success, data) {
            if (success) {
                var id = gallery._id;
                if (!id) {
                    resolvePictures(data);
                    $scope.galleries.push(data);
                }

                $scope.currentGallery = new models.PictureGallery();
                $scope.currentPicture = null;
            }
        });
    };

    $scope.getPicturePath = function (pictureId) {
        return "/api/picture/" + pictureId;
    };

    $scope.selectGallery = function (gallery) {
        $scope.currentGallery = gallery;
    };

    $scope.onFileSelect = function ($files) {
        $files.forEach(function (file) {
            $scope.upload = $upload.upload({
                url: "/api/upload/picture",
                data: {},
                file: file
            });

            $scope.upload.progress(function (evt) {
                var percent = parseInt(100.0 * evt.loaded / evt.total);
                console.log(percent);
            });

            $scope.upload.success(function (data, status, headers, config) {
                console.log($scope.currentGallery);
                $scope.currentGallery.$pictures.push(data);
            });
        });
    };
});
app.controller("PlaylistController", function ($scope, models, globalService, $timeout, uiService) {

    function updateReference(pl) {
        pl.$galleries = [];
        pl.galleries.forEach(function (g) {
            var type = g.type;
            var objectId = g.objectId;
            globalService.findById(objectId, type, function (success, data) {
                if (success) pl.$galleries.push(data);
            });
        });
    }

    angular.element(document).ready(function () {
        globalService.findAllByExample({ publish: true, entity: "Playlists" }, function (success, data) {
            if (success && data) {
                data.forEach(function (d) {
                    updateReference(d);
                });
                $scope.playlists = data;
            }
        });

        $scope.pictureDialog = new uiService.Dialog(".modal.live-picture-modal");
        $scope.videoDialog = new uiService.Dialog(".modal.live-video-modal");

        globalService.findAllByExample({ entity: "PictureGalleries", publish: true }, function (success, data) {
            if (success) {
                $scope.pictures = data;
            }
        });

        globalService.findAllByExample({ entity: "VideoGalleries", publish: true }, function (success, data) {
            if (success) {
                $scope.videos = data;
            }
        });

        globalService.findAllByExample({ entity: "Branchs", publish: true }, function (success, data) {
            if (success) {
                $scope.branchs = data;
                $scope.branchs.forEach(function (branch) {
                    branch.$devices = [];
                    branch.deviceIds.forEach(function (id) {
                        globalService.findById(id, "Devices", function (success, data) {
                            if (success) {
                                branch.$devices.push(data);
                            }
                        });
                    });
                });
            }
        });

    });

    $scope.playlists = [];
    $scope.currentPlaylist = new models.Playlist();
    $scope.editMode = true;
    $scope.pictures = [];
    $scope.videos = [];
    $scope.dragging = false;
    //$scope.pictureDialog = null;
    //$scope.videoDialog = null;

    // Picture and video dialog
    $scope.$selectedPictureGalleries = [];
    $scope.$selectedVideoGalleries = [];

    $scope.selectBranch = function (branch) {
        var pl = $scope.currentPlaylist;

        if ($scope.isSelectedBranch(branch)) {
            branch.deviceIds.forEach(function(id){
                var index = pl.deviceIds.indexOf(id);
                if(index !== -1) pl.deviceIds.splice(index, 1);
            });
        } else {
            branch.$devices.forEach(function (device) {
                if (pl.deviceIds.indexOf(device._id) === -1) {
                    pl.deviceIds.push(device._id);
                }
            });
        }
    };

    $scope.isSelectedBranch = function (branch) {
        var pl = $scope.currentPlaylist;
        var selected = false;
        pl.deviceIds.forEach(function (id) {
            if (branch.deviceIds.indexOf(id) !== -1) {
                selected = true;
            }
        });

        return selected;
    };

    $scope.selectDevice = function(device){
        var pl = $scope.currentPlaylist;
        var id = device._id;
        var index = pl.deviceIds.indexOf(id);
        if(index === -1) {
            pl.deviceIds.push(id);
        }else {
            pl.deviceIds.splice(index, 1);
        }
    };

    $scope.isSelectedDevice = function(device){
        var pl = $scope.currentPlaylist;
        var id = device._id;
        var index = pl.deviceIds.indexOf(id);
        return index !== -1;
    };

    $scope.sortableOptions = {
        update: function (e, ui) {
            console.log("[Update]");
        },
        start: function (e, ui) {
            console.log("[Start]");
            $scope.dragging = true;

            $scope.$apply();
        },
        stop: function (e, ui) {
            console.log("[Stop]");
            $scope.dragging = false;

            $scope.$apply();
        },
        axis: 'y'
    };

    $scope.$selectGallery = function (gallery, galleries) {
        var index = galleries.indexOf(gallery);
        if (index === -1) {
            galleries.push(gallery);
        } else {
            galleries.splice(index, 1);
        }
    };

    $scope.$isSelected = function (entity, gallery) {
        if (entity === "VideoGalleries") {
            return $scope.$selectedVideoGalleries.indexOf(gallery) !== -1;
        }
        return $scope.$selectedPictureGalleries.indexOf(gallery) !== -1;
    };

    $scope.$isSelectedPictureGallery = function (gallery) {
        return $scope.$isSelected(gallery.entity, gallery);
    };

    $scope.$isSelectedVideoGallery = function (gallery) {
        return $scope.$isSelected(gallery.entity, gallery);
    };

    $scope.$selectPictureGallery = function (gallery) {
        $scope.$selectGallery(gallery, $scope.$selectedPictureGalleries);
    };

    $scope.$selectVideoGallery = function (gallery) {
        $scope.$selectGallery(gallery, $scope.$selectedVideoGalleries);
    };

    $scope.removeGallery = function (gallery) {
        var index = $scope.currentPlaylist.$galleries.indexOf(gallery);
        $scope.currentPlaylist.$galleries.splice(index, 1);
    };

    // Show video/picture dialog
    // * clear all previouse selection.
    // * call show method
    $scope.showVideoDialog = function () {
        $scope.$selectedVideoGalleries = [];
        $scope.videoDialog.show();
    };

    $scope.showPictureDialog = function () {
        $scope.$selectedPictureGalleries = [];
        $scope.pictureDialog.show();
    };

    // Show video/picture dialog
    // * call close method
    // * recalcualate selected list
    $scope.$hidePictureDialog = function () {
        $scope.pictureDialog.close();
        $scope.$selectedPictureGalleries.forEach(function (g) {
            var newRef = angular.copy(g);
            $scope.currentPlaylist.$galleries.push(newRef);
        });
    };

    $scope.$hideVideoDialog = function () {
        $scope.videoDialog.close();
        $scope.$selectedVideoGalleries.forEach(function (g) {
            var newRef = angular.copy(g);
            $scope.currentPlaylist.$galleries.push(newRef);
        });
    };

    $scope.toggleMode = function () {
        $scope.editMode = !$scope.editMode;
    };

    $scope.selectPlaylist = function (pl) {
        $scope.currentPlaylist = pl;
    };

    $scope.isSelectedPlaylist = function (pl) {
        return $scope.currentPlaylist === pl;
    };

    $scope.newPlaylist = function () {
        $scope.editMode = true;
        $scope.currentPlaylist = new models.Playlist();
    };

    $scope.savePlaylist = function (pl) {
        console.log(pl);

        pl.galleries = [];
        pl.$galleries.forEach(function (p) {
            var detail = new models.GalleryDetail();
            detail.type = p.entity;
            detail.objectId = p._id;
            pl.galleries.push(detail);
        });

        globalService.update(pl, function (success, data) {

            if (success) {
                if (!pl._id) {
                    updateReference(data);
                    $scope.playlists.push(data);
                }

                $scope.currentPlaylist = new models.Playlist();
            }
        });
    };
});
app.controller("UploadController", function($scope){

});
app.controller("VideoController", function ($scope, models, globalService, $timeout, $upload) {

    function createReference(video) {
        video.$videos = [];
        video.objectIds.forEach(function (id) {
            globalService.findById(id, "Videos", function (success, data) {
                if (success) {
                    video.$videos.push(data);
                }
            });
        });
    }

    angular.element(document).ready(function () {
        globalService.findAllByExample({ publish: true, entity: "VideoGalleries" }, function (success, data) {
            if (success && data) {
                $scope.galleries = data;
                $scope.galleries.forEach(function (g) {
                    createReference(g);
                });
            }

            if ($scope.galleries.length > 0) {
                $scope.currentGallery = $scope.galleries[0];
            }
        });

    });

    $scope.galleries = [];
    $scope.currentGallery = new models.VideoGallery();
    $scope.currentVideo = null;
    $scope.editMode = false;

    $scope.isSelectedVideo = function (video) {
        return $scope.currentVideo === video;
    };

    $scope.getVideoPath = function (video) {
        return "/api/video/" + video._id;
    };

    $scope.selectVideo = function (video) {
        $scope.currentVideo = video;
    };

    $scope.removeVideo = function (video) {
        var index = $scope.currentGallery.$videos.indexOf(video);
        $scope.currentGallery.$videos.splice(index, 1);
        $scope.currentVideo = null;
    };

    $scope.selectGallery = function (gallery) {
        $scope.currentGallery = gallery;
    };

    $scope.toggleMode = function () {
        $scope.editMode = !$scope.editMode;
    };

    $scope.isSelected = function (gallery) {
        return gallery === $scope.currentGallery;
    };

    $scope.removeGallery = function (gallery) {
        gallery.publish = false;

        $timeout(function () {
            globalService.update(gallery, function (success, data) {
                if (success) {
                    var index = $scope.galleries.indexOf(gallery);
                    $scope.galleries.splice(index, 1);
                    $scope.currentGallery = new models.VideoGallery();
                }
            });
        }, 500);
    };

    $scope.editGallery = function (gallery) {
        $scope.editMode = true;
        $scope.currentGallery = gallery;
    };

    $scope.saveGallery = function (gallery) {

        gallery.objectIds = [];
        gallery.$videos.forEach(function (v) {
            gallery.objectIds.push(v._id);
        });

        globalService.update(gallery, function (success, data) {
            if (success) {
                if (!gallery._id) {
                    createReference(data);
                    $scope.galleries.push(data);
                }
                $scope.currentGallery = new models.VideoGallery();
            }
        });
    };

    $scope.onFileSelect = function ($files) {
        $files.forEach(function (file) {
            $scope.upload = $upload.upload({
                url: "/api/upload/video",
                data: {},
                file: file
            });

            $scope.upload.progress(function (evt) {
                var percent = parseInt(100.0 * evt.loaded / evt.total);
                console.log(percent);
            });

            $scope.upload.success(function (data, status, headers, config) {
                console.log($scope.currentGallery);
                $scope.currentGallery.$videos.push(data);
            });
        });
    };
});