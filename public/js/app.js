var app = angular.module("liveApplication", [
    "ngRoute",
    "angularFileUpload",
    "com.2fdevs.videogular",
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

