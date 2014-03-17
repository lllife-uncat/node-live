app.factory("models", function(){

    function Branch() {
        this.entity = "Branchs";
        this.branchId = "";
        this.name = "";
        this.deviceIds = [];
        this.description = "";
    }

    function Device() {
        this.entity = "Devices";
        this.deviceId = "";
        this.serialNumber = "";
    }

    return {
        Branch: Branch,
        Device: Device
    };
});