var expect = require("chai").expect;
var models = require("../app/modules/db.js").models;
var Base = models.Base;

describe("Entity", function() {
    describe("(insert,update,delete)", function() {
        it("should save device success", function(done) {

            var device = new models.Device();
            device.deviceId = "D002";
            device.serialNumber = "S/N 002";

            device.save(function(success, data) {
                expect(success).to.equal(true);
                expect(data).to.not.equal(null);
                done();
            });

        });

        it("should find by id success", function(done) {
            var id = "53231451f519cc89955c7110";
            Base.findById(id, "Devices", function(success, data) {
                expect(success).to.equal(true);
                expect(data).to.not.equal(null);
                console.log(data);
                done();
            });
        });

        it("should find by example sucess", function(done) {
            var example = {
                deviceId: "D001"
            };
            Base.findByExample(example, "Devices", function(success, data) {
                expect(success).to.equal(true);
                expect(data.deviceId).to.equals("D001");
                done();
            });
        });

        it("should find all by example success", function(done) {
            var example = {
                deviceId : "D002"
            };

            Base.findAllByExample(example, "Devices", function(success, data) {
                expect(success).to.equal(true);
                expect(data.length > 5).to.equal(true);

                done();
            });

        });
    });
});
