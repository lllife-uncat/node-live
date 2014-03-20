app.factory("uiService", function () {

    function Dialog(id) {

        this.id = id;

        this.show = function () {
            $(this.id).modal().modal("show");
        };

        this.close = function() {
            $(this.id).modal("hide");
        };
    }

    return {
        Dialog: Dialog
    };
});