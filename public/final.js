var app = angular.module("liveApplication", [ 'ngRoute' ]);

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


app.factory("UIService", function(){



});
app.controller("BranchController", function($scope){
    $scope.message = "Hello message";
});
app.controller("HomeController", function ($scope, UIService) {

    angular.element(document).ready(function () {

    });
});


app.controller("MainController", function($scope){

});
app.controller("PictureController", function($scope){
    $scope.message = "picture controller";
});
app.controller("UploadController", function($scope){

});
app.controller("VideoController", function($scope){
    $scope.message = "video controller";
});