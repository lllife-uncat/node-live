var expect = require("chai").expect;
var models = require("../app/modules/db.js").models;
var api = require("../app/modules/playlist");

describe("[API]", function(){

  it("should find device playlist correctly", function(done){

    api.getPlaylists("001", function(success, data){

      expect(success).to.equal(true);
      expect(data).to.not.equal([]);
      expect(data).to.not.equal(null);

      console.log(data);
      done();

    });
  });
});
