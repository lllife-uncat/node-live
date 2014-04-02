app.controller("BranchController", function ($scope, $rootScope, models, globalService, playerService) {

    $rootScope.title = "Live Branch";

    /* Create/update current branch record.
     * Push return result into $scope.branchs
     * @params {boolean} success.
     * @@params {Branch} data.
     */
    function updateCallback(success, data) {
        if (success) {
            if (!$scope.currentBranch._id) {
                $scope.branchs.push(data);
            }
            $scope.currentBranch = new models.Branch();
        }
    }

    /* Find list of branchs by given example,
     * Update $scope.branchs to request results.
     * @params {boolean} success.
     * @params {Branch[]} data.
     */
    function findAllByExampleCallback(success, data) {
        if (success) {
            $scope.branchs = data;
            if ($scope.branchs.length > 0) {
                $scope.currentBranch = $scope.branchs[0];
            }
        }
    }

    /* Document.Ready handler.
     * Find branchs by example, update to $scope.branchs.
     * Find devices by example, update to $scope.devices.
     * Find playlists by example, update to $scope.playlists.
     */
    angular.element(document).ready(function () {
        var example = { entity: "Branchs", publish: true };
        globalService.findAllByExample(example, findAllByExampleCallback);

        globalService.findAllByExample({ entity: "Devices", publish: true }, function (success, data) {
            if (success && data) {
                $scope.devices = data;
            }
        });

        globalService.findAllByExample({ entity: "Playlists", publish: true }, function (success, data) {
            if (success && data) {
                $scope.playlists = data;
            }
        });
    });

    $scope.currentBranch = new models.Branch();
    $scope.currentDevice = new models.Device();
    $scope.branchs = [];
    $scope.devices = [];
    $scope.editMode = false;
    $scope.playlists = [];

    $scope.toggleMode = function () {
        $scope.editMode = !$scope.editMode;
    };

    $scope.removeBranch = function (branch) {
        branch.publish = false;
        globalService.update(branch, function (success, data) {
            if (success) {
                var index = $scope.branchs.indexOf(branch);
                $scope.branchs.splice(index, 1);
            }
        });
    };

    $scope.getPlaylists = function (id) {
//        var id = device._id;
        var playlist = _.filter($scope.playlists, function (pl) {
            return pl.deviceIds.indexOf(id) !== -1;
        });

        console.log(playlist);

        return playlist;
    };


    $scope.addDevice = function (device) {
        globalService.update($scope.currentDevice, function (success, data) {
            if (success) {
                if (device._id) {

                }
                else {
                    $scope.devices.push(data);
                    $scope.currentBranch.deviceIds.push(data._id);
                }

                $scope.currentDevice = new models.Device();
            }
        });
    };


    $scope.editDevice = function (deviceId) {
        var device = $scope.getDevice(deviceId);
        $scope.currentDevice = device;
    };

    $scope.getDevice = function (deviceId) {
        var device = _.findWhere($scope.devices, { _id: deviceId});
        return device;
    };

    $scope.removeDevice = function (deviceId) {
        var branch = $scope.currentBranch;
        console.log(branch);
        var index = branch.deviceIds.indexOf(deviceId);
        if (index !== -1) {
            branch.deviceIds.splice(index, 1);
        }
    };

    $scope.addBranch = function () {
        $scope.editMode = true;
        $scope.currentBranch = new models.Branch();
    };

    $scope.editBranch = function (branch) {
        $scope.editMode = true;
        $scope.currentBranch = branch;
    };

    $scope.save = function (entity) {
        console.log("[saving]");
        console.log(entity);

        globalService.update(entity, updateCallback);
    };

    $scope.selectBranch = function (branch) {
        $scope.currentBranch = branch;
    };

    $scope.isSelected = function (branch) {
        return branch === $scope.currentBranch;
    };
});