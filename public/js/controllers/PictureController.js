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