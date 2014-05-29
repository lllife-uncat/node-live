app.factory("playerService", function ($timeout) {
    function VideoPlayer() {

        var bv = new $.BigVideo();
        var play = false;

        this.start = function () {
            bv.init();
//            bv.show("/images/bg1.jpg");
            $timeout(function () {
                bv.show("/videos/oceans.mp4", { ambient: true });
                bv.getPlayer().volume(0);
                play = true;
            }, 500);
        };

        this.stop = function () {
            if (play) {
                bv.getPlayer().pause();
            } else {
                bv.getPlayer().play();
            }
            play = !play;
        };
    }

    return {
        video: new VideoPlayer()
    };
});
