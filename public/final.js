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

    $routeProvider.otherwise({ redirect: "/"});
});


app.factory("UIService", function(){



});
app.controller("HomeController", function ($scope, UIService) {

    angular.element(document).ready(function () {

        setTimeout(function () {
            $('#st-stack').stackslider();
        }, 100);
    });
});


app.controller("MainController", function($scope){

});
app.controller("UploadController", function($scope){

});