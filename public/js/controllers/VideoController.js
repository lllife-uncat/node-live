app.controller("VideoController", function ($scope, models, globalService, $timeout, $upload, $rootScope) {

    $rootScope.title = "Live Video";

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

            $timeout(function () {
                if ($scope.galleries.length > 0) {
                    var gall = $scope.galleries[0];
                    $scope.selectGallery(gall);
                }
            }, 500);
        });

    });

    $scope.galleries = [];
    $scope.currentGallery = new models.VideoGallery();
    $scope.currentVideo = null;
    $scope.editMode = false;

    $scope.config = {
        width: "100%",
        height: "auto"
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

            $timeout(function() {
                $scope.dragging = false;
                $scope.$apply();
            }, 500);
        }
    };

    $scope.playVideo = function (video) {
        $scope.currentVideo = null;

        $timeout(function () {
            $scope.currentVideo = video;
            $(".live-video").load();
            $(".live-video").load();
        }, 200);
    };

    $scope.isSelectedVideo = function (video) {
        return $scope.currentVideo === video;
    };

    $scope.getVideoPath = function (video) {
        if (!video) return "";
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
        if (gallery.$videos.length > 0) {
            $scope.playVideo(gallery.$videos[0]);
        }
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

    $scope.newGallery = function () {
        $scope.currentGallery = new models.VideoGallery();
        $scope.editMode = true;
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