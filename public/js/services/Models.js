app.factory("models", function () {

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

    function Picture() {
        this.title = "";
        this.description = "";
        this.entity = "Picutres";
        this.publish = true;
    }

    function PictureGallery() {
        this.title = "";
        this.description = "";
        this.objectIds = [];
        this.entity = "PictureGalleries";
        this.publish = true;
        this.$pictures = [];
    }

    function VideoGallery() {
        this.title = "";
        this.description = "";
        this.objectIds = [];
        this.entity = "VideoGalleries";
        this.$videos = [];
    }

    function GalleryDetail() {
        this.type = "Videos";
        this.objectId = "";
    }

    function Playlist() {
        this.title = "";
        this.deviceIds = [];
        this.galleries = [];
        this.$galleries = [];
        this.entity = "Playlists";
    }

    return {
        Branch: Branch,
        Device: Device,
        Picture: Picture,
        PictureGallery: PictureGallery,
        VideoGallery: VideoGallery,
        Playlist: Playlist,
        GalleryDetail: GalleryDetail
    };
});