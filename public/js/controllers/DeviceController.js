app.controller("DeviceController", function($scope, $rootScope, models, globalService, $timeout, uiService) {
    $rootScope.title = "Live Devices";
    $scope.devices = [];
    $scope.currentDevice = {};
    $scope.playlists = [];

    function updateReference(pl) {

        pl.$galleries = [];
        pl.galleries.forEach(function (g) {
            var type = g.type;
            var objectId = g.objectId;
            globalService.findById(objectId, type, function (success, data) {
                if (success)  {
                    $scope.updatePlayingType(data, pl);
                    pl.$galleries.push(data);
                }
            });
        });

    }

    angular.element(document).ready(function() {
        var example = {
            publish: true,
            entity: "Devices"
        };
        globalService.findAllByExample(example, function(success, data) {
            if (success) {
                $scope.devices = data;
            }
            if ($scope.devices.length > 0) {
                $scope.currentDevice = $scope.devices[0];
                globalService.findAllByExample({ deviceIds: $scope.devices[0]._id, publish: true, entity: "Playlists"}, function(success, data) {
                    if (success && data) {
                        data.forEach(function(d) {
                            updateReference(d);
                        });
                        $scope.playlists = data;
                    }
                });
            }
        });
    });
    $scope.isSelectedDevice = function(dv) {
        return $scope.currentDevice === dv;
    };
    $scope.selectDevice = function (dv) {
		console.log(dv);
        $scope.currentDevice = dv;
        globalService.findAllByExample({ deviceIds: dv._id, publish: true, entity: "Playlists"}, function(success, data) {
                    if (success && data) {
                        data.forEach(function(d) {
                            updateReference(d);
                        });
                        $scope.playlists = data;
                    }
                });
    };
    $scope.updatePlayingType = function(gallery, pl){

        var detail = _.find(pl.galleries, function(e){
           return e.objectId === gallery._id;
        });

        if(detail) {
            gallery.$playing = detail.playing;
        }else {
            gallery.$playing = new models.PlayingType().sequence;
        }
    };
});