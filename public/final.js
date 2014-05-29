var app = angular.module("liveApplication", [
    "ngRoute",
    "angularFileUpload",
//    "com.2fdevs.videogular",
    "ui.sortable"]);

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

/*
app.run(function($location, $routeScope){
    $routeScope.$on("$routeChangeSuccess", function(event, current, previous){
        $rootScope.title = previous;
        console.log(current);
    });
});
*/




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
        this.$playing = new PlayingType().random;
    }

    function VideoGallery() {
        this.title = "";
        this.description = "";
        this.objectIds = [];
        this.entity = "VideoGalleries";
        this.$videos = [];
        this.$playing = new PlayingType().random;
    }

    function PlayingType() {
        this.sequence = "Sequence";
        this.random = "Random";
    }

    function GalleryDetail() {
        this.type = "Videos";
        this.objectId = "";

        // Sequence / Random
        this.playing = new PlayingType().sequence;
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
        GalleryDetail: GalleryDetail,
        PlayingType: PlayingType
    };
});
app.factory("playerService", function ($timeout) {
    function VideoPlayer() {

        var bv = new $.BigVideo();
        var play = false;

        this.start = function () {
            bv.init();
//            bv.show("/images/bg1.jpg");
            $timeout(function () {
                bv.show("/videos/oceans.mp4", { ambient: true });
                bv.getPlayer().volume(0);
                play = true;
            }, 500);
        };

        this.stop = function () {
            if (play) {
                bv.getPlayer().pause();
            } else {
                bv.getPlayer().play();
            }
            play = !play;
        };
    }

    return {
        video: new VideoPlayer()
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
/**
* Manage all branch and device infomation.
* Dependencies
* models: Entity object.
* globalService: Web service manager for persist information.
* playerService:
*/
app.controller("BranchController", function ($scope, $rootScope, models, globalService, playerService) {

  $rootScope.title = "Live Branch";

  /**
  * Create/update current branch record.
  * Push return result into $scope.branchs
  * @param {Boolean} success.
  * @param {Branch} data.
  */
  function updateCallback(success, data) {
    if (success) {
      if (!$scope.currentBranch._id) {
        $scope.branchs.push(data);
      }
      $scope.currentBranch = new models.Branch();
    }
  }

  /**
  * Find list of branchs by given example,
  * Update $scope.branchs to request results.
  * @param {Boolean} success.
  * @param {Branch[]} data.
  */
  function findAllByExampleCallback(success, data) {
    if (success) {
      $scope.branchs = data;
      if ($scope.branchs.length > 0) {
        $scope.currentBranch = $scope.branchs[0];
      }
    }
  }

  /**
  * Document.Ready handler.
  * Find branchs by example, update to $scope.branchs.
  * Find devices by example, update to $scope.devices.
  * Find playlists by example, update to $scope.playlists.
  */
  angular.element(document).ready(function () {
    var example = { entity: "Branchs", publish: true };
    globalService.findAllByExample(example, findAllByExampleCallback);

    globalService.findAllByExample({ entity: "Devices", publish: true }, function (success, data) {
      if (success && data) {
        $scope.devices = data;
      }
    });

    globalService.findAllByExample({ entity: "Playlists", publish: true }, function (success, data) {
      if (success && data) {
        $scope.playlists = data;
      }
    });
  });

  /**
  * All controller variable.
  * this.currentBranch: current selected branch.
  * this.currentDevice: current selected device.
  * this.barnchs: all branchs.
  * this.devices: all devices.
  * this.editMode: current mode.
  * this.playlists: all playlists.
  */
  $scope.currentBranch = new models.Branch();
  $scope.currentDevice = new models.Device();
  $scope.branchs = [];
  $scope.devices = [];
  $scope.editMode = false;
  $scope.playlists = [];

  /**
  * Toggle edit mode.
  * edit: Show input form.
  * !edit: Show table.
  */
  $scope.toggleMode = function () {
    $scope.editMode = !$scope.editMode;
  };

  /**
  * Remove geven brach from database and page.
  * @param {Object} branch.
  */
  $scope.removeBranch = function (branch) {
    branch.publish = false;
    globalService.update(branch, function (success, data) {
      if (success) {
        var index = $scope.branchs.indexOf(branch);
        $scope.branchs.splice(index, 1);
      }
    });
  };

  /**
  * Get playlist by id.
  * @param {String} id: playlist's id.
  * @return {Object} playlist.
  */
  $scope.getPlaylists = function (id) {
    //        var id = device._id;
    var playlist = _.filter($scope.playlists, function (pl) {
      return pl.deviceIds.indexOf(id) !== -1;
    });

    console.log(playlist);

    return playlist;
  };

  /**
  * Add insert new device into database via web service.
  * @param {Object} device.
  */
  $scope.addDevice = function (device) {
    globalService.update($scope.currentDevice, function (success, data) {
      if (success) {
        if (device._id) {

        }
        else {
          $scope.devices.push(data);
          $scope.currentBranch.deviceIds.push(data._id);
        }

        $scope.currentDevice = new models.Device();
      }
    });
  };

  /**
  * Show geven device in form.
  * @param {String} deviceId.
  */
  $scope.editDevice = function (deviceId) {
    var device = $scope.getDevice(deviceId);
    $scope.currentDevice = device;
  };

  /**
  * Get device by id.
  * @param {String} deviceId.
  * @return {Object} device.
  */
  $scope.getDevice = function (deviceId) {
    var device = _.findWhere($scope.devices, { _id: deviceId});
    return device;
  };

  /**
  * Remove device from current branch.
  * @param {String} deviceId.
  */
  $scope.removeDevice = function (deviceId) {
    var branch = $scope.currentBranch;
    console.log(branch);
    var index = branch.deviceIds.indexOf(deviceId);
    if (index !== -1) {
      branch.deviceIds.splice(index, 1);
    }
  };

  /**
  * Show form to add new branch.
  */
  $scope.addBranch = function () {
    $scope.editMode = true;
    $scope.currentBranch = new models.Branch();
  };

  /**
  * Show geven brach for edit.
  */
  $scope.editBranch = function (branch) {
    $scope.editMode = true;
    $scope.currentBranch = branch;
  };

  /**
  * Update entity object into database vai web service.
  */
  $scope.save = function (entity) {
    console.log("[saving]");
    console.log(entity);
    globalService.update(entity, updateCallback);
  };

  /**
  * Show given brach in web page.
  */
  $scope.selectBranch = function (branch) {
    $scope.currentBranch = branch;
  };

  /**
  * Check is branch is selected.
  */
  $scope.isSelected = function (branch) {
    return branch === $scope.currentBranch;
  };
});

/**
* HomeController manage home page.
*/
app.controller("HomeController", function ($scope, $timeout, $rootScope, playerService, globalService) {

  $rootScope.title = "Live Home";

  angular.element(document).ready(function () {

    //        playerService.video.start();

    globalService.findAllByExample({publish: true, entity: "Videos"}, function (success, data) {
      if (success && data) {
        $scope.videos = data;

        if ($scope.videos.length > 0) {
          var video = $scope.videos[0];
          $scope.selectVideo(video);
        }
      }
    });

  });

  $scope.videos = [];
  $scope.currentVideo = null;

  $scope.selectVideo = function (video) {
    $scope.currentVideo = video;
    console.log(video);

    $scope.playVideo(video);
  };

  $scope.isSelectedVideo = function (video) {
    return $scope.currentVideo === video;
  };

  $scope.getVideoPath = function (video) {
    if (!video) return "";
    return "/api/video/" + video._id;
  };

  $scope.playVideo = function (video) {
    $scope.currentVideo = null;

    $timeout(function () {
      $scope.currentVideo = video;
      $(".live-video").load();
    }, 200);
  };
});


app.controller("MainController", function($scope, playerService, globalService){
    $scope.stopVideo = function(){
        // playerService.video.stop();
    };

    angular.element(document).ready(function(){
//        playerService.video.start();

    });

});

app.controller("PictureController", function ($scope, $rootScope, globalService, models, $upload, $timeout) {

    $rootScope.title = "Live Picture";

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

            $timeout(function() {
                $scope.dragging = false;
                $scope.$apply();
            }, 500);
        }
    };

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
app.controller("PlaylistController", function ($scope, $rootScope, models, globalService, $timeout, uiService) {

    $rootScope.title = "Live Playlist";

    function updateReference(pl) {

        pl.$galleries = [];
        pl.galleries.forEach(function (g) {
            var type = g.type;
            var objectId = g.objectId;
            globalService.findById(objectId, type, function (success, data) {
                if (success)  {
                    $scope.updatePlayingType(data, pl);
                    pl.$galleries.push(data);
                }
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
    $scope.editMode = false;
    $scope.pictures = [];
    $scope.videos = [];
    $scope.dragging = false;
    //$scope.pictureDialog = null;
    //$scope.videoDialog = null;

    // Picture and video dialog
    $scope.$selectedPictureGalleries = [];
    $scope.$selectedVideoGalleries = [];

    $scope.editPlaylist = function(pl){
        $scope.editMode = true;
        $scope.currentPlaylist = pl;
    };

    $scope.removePlaylist = function(pl){
        pl.publish = false;
        globalService.update(pl, function(success, data){
            if(success) {
                var index = $scope.playlists.indexOf(pl);
                $scope.playlists.splice(index, 1);
            }else {
                console.error(data);
            }
        });
    };

    $scope.updatePlayingType = function(gallery, pl){

        var detail = _.find(pl.galleries, function(e){
           return e.objectId === gallery._id;
        });

        if(detail) {
            gallery.$playing = detail.playing;
        }else {
            gallery.$playing = new models.PlayingType().sequence;
        }
    };

    $scope.changePlayingType = function(gallery){
        var pt = new models.PlayingType();
        var sequence = pt.sequence;
        var random = pt.random;

        if(gallery.$playing === sequence) {
            gallery.$playing = random;
        }else {
            gallery.$playing = sequence;
        }
    };

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

            newRef.$playing = new models.PlayingType().sequence;
            $scope.currentPlaylist.$galleries.push(newRef);
        });
    };

    $scope.$hideVideoDialog = function () {
        $scope.videoDialog.close();
        $scope.$selectedVideoGalleries.forEach(function (g) {
            var newRef = angular.copy(g);

            newRef.$playing = new models.PlayingType().sequence;
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
            detail.playing = p.$playing;
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
/**
* VideoController manage all video information.
* Dependencies
* models: Entity object.
* globalService: Entity information retriever.
* $upload: File upload module.
*/
app.controller("VideoController", function ($scope, models, globalService, $timeout, $upload, $rootScope) {

  $rootScope.title = "Live Video";

  /**
  * Append dependency information into gallery.
  * @param {Object} video : video gallery.
  */
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

  /**
  * Document ready operation.
  * 1. Load all video gallery via web service.
  * 2. Initial this.gallerties variable.
  * 3. Map gallery with association info using createRefernce function.
  */
  angular.element(document).ready(function () {
    globalService.findAllByExample({ publish: true, entity: "VideoGalleries" }, function (success, data) {
      if (success && data) {
        $scope.galleries = data;
        $scope.galleries.forEach(function (g) {
          createReference(g);
        });
      }

      $timeout(function () {
        if ($scope.galleries.length > 0) {
          var gall = $scope.galleries[0];
          $scope.selectGallery(gall);
        }
      }, 500);
    });

  });

  /**
  * All controller variables.
  * this.galleries: all video galleries.
  * this.currentGallery: current selected gallerty.
  * this.currentVideo: selected video.
  * this.editMode: current mode.
  * this.config:
  */
  $scope.galleries = [];
  $scope.currentGallery = new models.VideoGallery();
  $scope.currentVideo = null;
  $scope.editMode = false;

  $scope.config = {
    width: "100%",
    height: "auto"
  };

  /**
  * Sortable option.
  */
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

      $timeout(function() {
        $scope.dragging = false;
        $scope.$apply();
      }, 500);
    }
  };


  /**
  * Start playing video.
  * @param {Object} video.
  */
  $scope.playVideo = function (video) {
    $scope.currentVideo = null;

    $timeout(function () {
      $scope.currentVideo = video;
      $(".live-video").load();
      $(".live-video").load();
    }, 200);
  };


  /**
  * Is video selected.
  * @param {Object} video.
  * @return {Boolean} is selected.
  */
  $scope.isSelectedVideo = function (video) {
    return $scope.currentVideo === video;
  };

  /**
  * Generate http uri for given  video.
  * @param {Object} video.
  * @return {String} http uri.
  */
  $scope.getVideoPath = function (video) {
    if (!video) return "";
    return "/api/video/" + video._id;
  };

  /**
  * Set video as selected item.
  * @param {Object} video.
  */
  $scope.selectVideo = function (video) {
    $scope.currentVideo = video;
  };

  /**
  * Remove video from gallery.
  * @param {Object} video.
  */
  $scope.removeVideo = function (video) {
    var index = $scope.currentGallery.$videos.indexOf(video);
    $scope.currentGallery.$videos.splice(index, 1);
    $scope.currentVideo = null;
  };

  /**
  * Set gallery as selected item.
  * @param {Object} gallery: video gallery.
  */
  $scope.selectGallery = function (gallery) {
    $scope.currentGallery = gallery;
    if (gallery.$videos.length > 0) {
      $scope.playVideo(gallery.$videos[0]);
    }
  };

  /**
  * Toggle edit mode.
  */
  $scope.toggleMode = function () {
    $scope.editMode = !$scope.editMode;
  };

  /**
  * Is gallery selected.
  */
  $scope.isSelected = function (gallery) {
    return gallery === $scope.currentGallery;
  };

  /**
  * Remove gallery from database via web service.
  * @param {Object} gallery: video gallery.
  */
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

  /**
  * Show from for adding new gallery.
  */
  $scope.newGallery = function () {
    $scope.currentGallery = new models.VideoGallery();
    $scope.editMode = true;
  };

  /**
  * Display gallery as edit mode.
  * @param {Object} gallery: video gallery.
  */
  $scope.editGallery = function (gallery) {
    $scope.editMode = true;
    $scope.currentGallery = gallery;
  };


  /**
  * Save video gallery into database via web service.
  * @param {Object} video gallery.
  */
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

  /**
  * Upload file immediatly alter select video files.
  * @param {Array} list of video files.
  */
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
