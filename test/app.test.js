const assert = require("assert");
const expect = require("chai").expect;
const request = require("supertest");
const app = require("../app");

describe("Test path /", function() {
  it("should return OK status", function() {
    return request(app)
      .get("/")
      .then(function(response) {
        assert.equal(response.status, 200);
      });
  });
});

describe("Test path /api/s1", function() {
  it("should return OK status", function() {
    return request(app)
      .get("/api/s1")
      .then(function(response) {
        assert.equal(response.status, 200);
      });
  });
});
