var expect = require("chai").expect;
var models = require("../app/modules/db.js").models;
var Base = models.Base;

describe("[Entity]", function() {
    describe("", function() {
        it("should save device success", function(done) {

            var device = new models.Device();
            device.deviceId = "D003";
            device.serialNumber = "S/N 002";

            Base.update(device, function(success, data) {
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
                expect(data.deviceId).to.equals("D001");
                done();
            });
        });

        it("should not find unallow entity", function(done) {

            var example = {
                deviceId: "D001"
            };

            Base.findAllByExample(example, "Xevices", function(success, data) {
                expect(success).to.equal(false);
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
    });
});
