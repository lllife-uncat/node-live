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