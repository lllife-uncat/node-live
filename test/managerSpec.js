var expect = require("chai").expect;
var models = require("../app/modules/db.js").models;
var Base = models.Base;

describe("[Entity]", function() {

    describe("[Device]", function() {
        it("should interite success", function(done) {
            var device = new models.Device();
            expect(device.save).to.not.equal(undefined);
            done();
        });
    });

    describe("[Device]", function() {
        it("should update success", function(done, skip) {

            skip();

            var branch = new models.Branch();
            Base.update(branch, function(success, data) {
                expect(success).to.equal(true);
                expect(data).to.not.equal(null);
                done();
            });
        });
    });

    describe("[Device]", function() {
        it("should save success", function(done, skip) {

            skip();

            var device = new models.Device();
            device.deviceId = "D003";
            device.serialNumber = "S/N 002";

            //Base.update(device, function(success, data) {
            device.save(function(success, data) {
                if (!success) console.error("Error", data);

                expect(success).to.equal(true);
                expect(data).to.not.equal(null);
                done();
            });

        });

        it("should find by id success", function(done) {
            var id = "53245329b53e2c019d52a839";
            Base.findById(id, "Devices", function(success, data) {
                expect(success).to.equal(true);
                expect(data).to.not.equal(null);
                done();
            });
        });


        it("should find by example success", function(done) {
            var example = {
                deviceId: "D002"
            };
            Base.findByExample(example, "Devices", function(success, data) {
                expect(success).to.equal(true);
                expect(data.deviceId).to.equals("D002");
                done();
            });
        });

        it("should not find un-allow entity", function(done) {

            var example = {
                deviceId: "D001"
            };

            Base.findAllByExample(example, "Xevices", function(success, data) {
                expect(success).to.equal(false);
                done();
            });
        });

        it("should find all by example success", function(done) {
            var example = {
                deviceId: "D002"
            };

            Base.findAllByExample(example, "Devices", function(success, data) {
                expect(success).to.equal(true);
                expect(data.length > 1).to.equal(true);
                done();
            });
        });

        it("should update video succuess", function(done) {
            var video = new models.Video();
            video.title = "Test title";
            video.description = "Test description";
            video.save(function(success, data){
              expect(success).to.equal(true);
              expect(data.title).to.equal(data.title);
              expect(data._id).to.not.equal(null);
              done();
            });
        });

    });
});
