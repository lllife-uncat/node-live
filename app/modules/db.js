// Base
// @property {date} createDate
// @property {date} lastUpdate
function Base() {
    this.createDate = new Date();
    this.lastUpdate = new Date();
    this.identifier = "";

    this.entity = "Bases";
    Object.preventExtensions(this);
}

// Video
// @property {string} title
// @property {string} description
function Video() {
    this.title = "";
    this.description = "";

    this.entity = "Videos";
    Base.apply(this, arguments);
    Object.preventExtensions(this);
}

// Picture
// @property {string} title
// @property {string} description
function Picture() {
    this.title = "";
    this.description = "";

    this.entity = "Pictures";
    Base.apply(this, arguments);
    Object.preventExtensions(this);
}

// Branch
// @property {string} name
// @property {string} description
function Branch() {
    this.name = "";
    this.description = "";
    this.deviceIds = [];

    this.entity = "Branchs";
    Base.apply(this, arguments);
    Object.preventExtensions(this);
}

// Device
// @property {string} deviceId
// @property {string} serialNumber
function Device() {
    this.deviceId = "";
    this.serialNumber = "";
    this.pictureGalleryIds = [];
    this.videoGalleryIds = [];

    this.entity = "Devices";
    Base.apply(this, arguments);
    Object.preventExtensions(this);
}

// Gallery
// @property {string} title
// @property {string} description
// @property {string} galleryType, available in GellertyType's property
function ImageGallery() {
    this.title = "";
    this.description = "";
    this.objectIds = [];

    this.entity = "ImageGalleries";
    Base.apply(this, arguments);
    Object.preventExtensions(this);
}

// VideoGallery
// @property {string} title
// @property {string} description
function VideoGallery() {
    this.title = "";
    this.description = "";
    this.objectIds = [];

    this.entity = "VideoGalleries";
    Base.apply(this, arguments);
    Object.preventExtensions(this);
}

