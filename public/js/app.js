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

