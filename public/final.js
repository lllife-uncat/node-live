var app = angular.module("liveApplication", [ "ngRoute", "angularFileUpload" ]);

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

    return {
        Branch: Branch,
        Device: Device,
        Picture: Picture,
        PictureGallery: PictureGallery
    };
});
app.factory("uiService", function(){



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
    });

    $scope.currentBranch = new models.Branch();
    $scope.currentDevice = new models.Device();
    $scope.branchs = [];
    $scope.devices = [];
    $scope.editMode = false;
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
app.controller("HomeController", function ($scope, UIService) {

    angular.element(document).ready(function () {

    });
});


app.controller("MainController", function($scope){

});
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
app.controller("UploadController", function($scope){

});
app.controller("VideoController", function($scope){
    $scope.message = "video controller";
});