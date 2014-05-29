/**
* Manage all branch and device infomation.
* Dependencies
* models: Entity object.
* globalService: Web service manager for persist information.
* playerService:
*/
app.controller("BranchController", function ($scope, $rootScope, models, globalService, playerService) {

  $rootScope.title = "Live Branch";

  /**
  * Create/update current branch record.
  * Push return result into $scope.branchs
  * @param {Boolean} success.
  * @param {Branch} data.
  */
  function updateCallback(success, data) {
    if (success) {
      if (!$scope.currentBranch._id) {
        $scope.branchs.push(data);
      }
      $scope.currentBranch = new models.Branch();
    }
  }

  /**
  * Find list of branchs by given example,
  * Update $scope.branchs to request results.
  * @param {Boolean} success.
  * @param {Branch[]} data.
  */
  function findAllByExampleCallback(success, data) {
    if (success) {
      $scope.branchs = data;
      if ($scope.branchs.length > 0) {
        $scope.currentBranch = $scope.branchs[0];
      }
    }
  }

  /**
  * Document.Ready handler.
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

  /**
  * All controller variable.
  * this.currentBranch: current selected branch.
  * this.currentDevice: current selected device.
  * this.barnchs: all branchs.
  * this.devices: all devices.
  * this.editMode: current mode.
  * this.playlists: all playlists.
  */
  $scope.currentBranch = new models.Branch();
  $scope.currentDevice = new models.Device();
  $scope.branchs = [];
  $scope.devices = [];
  $scope.editMode = false;
  $scope.playlists = [];

  /**
  * Toggle edit mode.
  * edit: Show input form.
  * !edit: Show table.
  */
  $scope.toggleMode = function () {
    $scope.editMode = !$scope.editMode;
  };

  /**
  * Remove geven brach from database and page.
  * @param {Object} branch.
  */
  $scope.removeBranch = function (branch) {
    branch.publish = false;
    globalService.update(branch, function (success, data) {
      if (success) {
        var index = $scope.branchs.indexOf(branch);
        $scope.branchs.splice(index, 1);
      }
    });
  };

  /**
  * Get playlist by id.
  * @param {String} id: playlist's id.
  * @return {Object} playlist.
  */
  $scope.getPlaylists = function (id) {
    //        var id = device._id;
    var playlist = _.filter($scope.playlists, function (pl) {
      return pl.deviceIds.indexOf(id) !== -1;
    });

    console.log(playlist);

    return playlist;
  };

  /**
  * Add insert new device into database via web service.
  * @param {Object} device.
  */
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

  /**
  * Show geven device in form.
  * @param {String} deviceId.
  */
  $scope.editDevice = function (deviceId) {
    var device = $scope.getDevice(deviceId);
    $scope.currentDevice = device;
  };

  /**
  * Get device by id.
  * @param {String} deviceId.
  * @return {Object} device.
  */
  $scope.getDevice = function (deviceId) {
    var device = _.findWhere($scope.devices, { _id: deviceId});
    return device;
  };

  /**
  * Remove device from current branch.
  * @param {String} deviceId.
  */
  $scope.removeDevice = function (deviceId) {
    var branch = $scope.currentBranch;
    console.log(branch);
    var index = branch.deviceIds.indexOf(deviceId);
    if (index !== -1) {
      branch.deviceIds.splice(index, 1);
    }
  };

  /**
  * Show form to add new branch.
  */
  $scope.addBranch = function () {
    $scope.editMode = true;
    $scope.currentBranch = new models.Branch();
  };

  /**
  * Show geven brach for edit.
  */
  $scope.editBranch = function (branch) {
    $scope.editMode = true;
    $scope.currentBranch = branch;
  };

  /**
  * Update entity object into database vai web service.
  */
  $scope.save = function (entity) {
    console.log("[saving]");
    console.log(entity);
    globalService.update(entity, updateCallback);
  };

  /**
  * Show given brach in web page.
  */
  $scope.selectBranch = function (branch) {
    $scope.currentBranch = branch;
  };

  /**
  * Check is branch is selected.
  */
  $scope.isSelected = function (branch) {
    return branch === $scope.currentBranch;
  };
});
