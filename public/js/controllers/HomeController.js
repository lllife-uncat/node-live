app.controller("HomeController", function ($scope, UIService) {

    angular.element(document).ready(function () {

        setTimeout(function () {
            $('#st-stack').stackslider();
        }, 100);
    });
});

