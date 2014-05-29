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
