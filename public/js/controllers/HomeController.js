/**
* HomeController manage home page.
*/
app.controller("HomeController", function ($scope, $timeout, $rootScope, playerService, globalService) {

  $rootScope.title = "Live Home";

  angular.element(document).ready(function () {

    //        playerService.video.start();

    globalService.findAllByExample({publish: true, entity: "Videos"}, function (success, data) {
      if (success && data) {
        $scope.videos = data;

        if ($scope.videos.length > 0) {
          var video = $scope.videos[0];
          $scope.selectVideo(video);
        }
      }
    });

  });

  $scope.videos = [];
  $scope.currentVideo = null;

  $scope.selectVideo = function (video) {
    $scope.currentVideo = video;
    console.log(video);

    $scope.playVideo(video);
  };

  $scope.isSelectedVideo = function (video) {
    return $scope.currentVideo === video;
  };

  $scope.getVideoPath = function (video) {
    if (!video) return "";
    return "/api/video/" + video._id;
  };

  $scope.playVideo = function (video) {
    $scope.currentVideo = null;

    $timeout(function () {
      $scope.currentVideo = video;
      $(".live-video").load();
    }, 200);
  };
});

