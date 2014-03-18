app.controller("PictureController", function ($scope, globalService, models, $upload) {

    angular.element(document).ready(function () {
        // Get all gallery
        // Find all picture under each gallery
        // Keep reference in .$pictures
        var example = { publish: true, entity: "PictureGalleries" };
        globalService.findAllByExample(example, function (success, data) {
            if (success) {
                $scope.galleries = data;
                $scope.galleries.forEach(function(g){
                    g.$pictures = [];
                    g.objectIds.forEach(function(id){
                        globalService.findById(id, "Pictures" , function(success, data){
                            if(success && data) {
                                g.$pictures.push(data);
                            }
                        });
                    });
                });
            }
        });
    });

    $scope.galleries = [];
    $scope.currentGallery = new models.PictureGallery();
    $scope.editMode = false;

    $scope.addGallery = function () {
        $scope.editMode = true;
        $scope.currentGallery = new models.PictureGallery();
    };

    $scope.isSelected = function (gallery) {
        return $scope.currentGallery === gallery;
    };

    $scope.selectGallery = function (gallery) {
        $scope.curerntGallery = gallery;
    };

    $scope.editGallery = function(gallery){
        $scope.editMode = true;
        $scope.currentGallery = gallery;
    };

    $scope.removeGallery = function(gallery){
        gallery.publish = false;
        globalService.update(gallery, function(success, data){
            if(success) {
                var index = $scope.galleries.indexOf(gallery);
                $scope.galleries.splice(index, 1);
            }
        });
    };

    $scope.toggleMode = function(){
        $scope.editMode = !$scope.editMode;
    };

    $scope.saveGallery = function (gallery) {
        // Check is $pictures already in objectIds.
        // Call update method in global service.
        // If OK
        // * Create new gallery instance.
        gallery.$pictures.forEach(function(pic){
            if(gallery.objectIds.indexOf(pic._id) == -1) {
                gallery.objectIds.push(pic._id);
            }
        });

        globalService.update(gallery, function (success, data) {
            if (success) {
                var id = gallery._id;
                if (!id) {
                    $scope.galleries.push(data);
                }
                $scope.currentGallery = new models.PictureGallery();
            }
        });
    };

    $scope.getPicturePath = function(pictureId){
        return "/api/picture/" + pictureId;
    };

    $scope.selectGallery = function (gallery) {
        $scope.currentGallery = gallery;
    };

    $scope.onFileSelect = function ($files) {
        $files.forEach(function (file) {
            $scope.upload = $upload.upload({
                url: "/api/upload",
                data: {},
                file: file
            });

            $scope.upload.progress(function (evt) {
                var percent = parseInt(100.0 * evt.loaded / evt.total);
                console.log(percent);
            });

            $scope.upload.success(function(data, status, headers, config){
                $scope.currentGallery.$pictures.push(data);
            });
        });
    };
});