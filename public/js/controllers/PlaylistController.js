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