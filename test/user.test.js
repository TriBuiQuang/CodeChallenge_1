import chai from "chai";
import chaiHttp from "chai-http";
import mongoose from "mongoose";
import { response } from "express";
import app from "../index.js";

import { users, findUser } from "./seed.js";
// Assertion Style
chai.should();

chai.use(chaiHttp);

describe("User API", () => {
   /**
    * TEST the POST route registration
    */
   describe("POST /api/v1/user/registration user 1", () => {
      it("It should get registration successful", (done) => {
         try {
            chai
               .request(app)
               .post("/api/v1/user/registration")
               .send({
                  username: users[0].username,
                  fullname: users[0].fullname,
                  password: "123",
                  role: users[0].role,
               })
               .end((err, response) => {
                  response.should.have.status(200);
                  done();
               });
         } catch (error) {
            console.error(error);
         }
      });
   });
   describe("POST /api/v1/user/registration user 2", () => {
      it("It should get registration successful", (done) => {
         try {
            chai
               .request(app)
               .post("/api/v1/user/registration")
               .send({
                  username: users[1].username,
                  fullname: users[1].fullname,
                  password: "123",
                  role: users[1].role,
                  belong: users[1].belong,
               })
               .end((err, response) => {
                  response.should.have.status(200);
                  done();
               });
         } catch (error) {
            console.error(error);
         }
      });
   });

   describe("POST /api/v1/user/registration user 3", () => {
      it("It should get registration successful", (done) => {
         try {
            chai
               .request(app)
               .post("/api/v1/user/registration")
               .send({
                  id: users[2]._id,
                  username: users[2].username,
                  fullname: users[2].fullname,
                  password: "123",
                  role: users[2].role,
                  belong: users[2].belong,
                  team: 1,
               })
               .end((err, response) => {
                  response.should.have.status(200);
                  done();
               });
         } catch (error) {
            console.error(error);
         }
      });
   });
   /**
    * TEST the POST route login
    */
   describe("POST /api/v1/user/login", () => {
      it("It should get login successful", (done) => {
         try {
            chai
               .request(app)
               .post("/api/v1/user/login")
               .send({
                  username: users[0].username,
                  password: users[0].password,
               })
               .end((err, response) => {
                  response.should.have.status(200);
                  done();
               });
         } catch (error) {
            console.error(error);
         }
      });
   });
   /**
    * TEST the GET route profile
    */
   /**
    * TEST the PUT route Change password
    */
   /**
    * TEST the GET route tree list
    */
   describe("GET /api/v1/user/tree", () => {
      it("It should get all the tree", (done) => {
         try {
            chai
               .request(app)
               .get("/api/v1/user/tree")
               .set("authentication", users[0].token)
               .end((err, response) => {
                  response.should.have.status(200);
                  response.should.be.a("object");
                  done();
               });
         } catch (error) {
            console.error(error);
         }
      });
   });
   /**
    * TEST the GET route team member list
    */
   describe("GET /api/v1/user/team-member?belong=1", () => {
      it("It should get all team member of room 1", (done) => {
         try {
            chai
               .request(app)
               .get("/api/v1/user/team-member?belong=1")
               .set("authentication", users[0].token)
               .end((err, response) => {
                  response.should.have.status(200);
                  response.should.be.a("object");
                  done();
               });
         } catch (error) {
            console.error(error);
         }
      });
   });
   /**
    * TEST the PUT route add member to team
    */
   describe("PUT /api/v1/user/add-member-to-team/", () => {
      it("It should add member to new team", (done) => {
         try {
            chai
               .request(app)
               .put("/api/v1/user/add-member-to-team/")
               .set("authentication", users[0].token)
               .send({
                  id: users[2]._id,
                  belong: 2,
                  team: 1,
               })
               .end((err, response) => {
                  response.should.have.status(200);
                  done();
               });
         } catch (error) {
            console.error(error);
         }
      });
   });
   /**
    * TEST the PUT route remove member from team
    */
   describe("PUT /api/v1/user/remove-member-from-team/", () => {
      it("It should remove member from team not original", (done) => {
         try {
            chai
               .request(app)
               .put("/api/v1/user/remove-member-from-team/")
               .set("authentication", users[0].token)
               .send({
                  id: users[2]._id,
                  belong: 2,
                  team: 1,
               })
               .end((err, response) => {
                  response.should.have.status(200);
                  done();
               });
         } catch (error) {
            console.error(error);
         }
      });
   });
});
