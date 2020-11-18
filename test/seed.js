import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// import User from "../models/UserModel.js";
import app from "../config/app.js";
import UserModel from "../api/models/UserModel.js";

const userOneID = new mongoose.Types.ObjectId();
const userTwoID = new mongoose.Types.ObjectId();
const userThreeID = new mongoose.Types.ObjectId();
const users = [
   {
      _id: userOneID,
      username: "userone",
      password: "123",
      fullname: "user one",
      role: "DIRECTOR",
      belong: null,
      project_working: [],

      token: jwt.sign(
         {
            userId: userOneID,
            username: "userone",
         },
         app.secret,
         { expiresIn: "1d" }
      ),
   },
   {
      _id: userTwoID,
      username: "usertwo",
      password: "123",
      fullname: "user two",
      role: "MANAGER",
      belong: 1,
      project_working: [],
      token: jwt.sign(
         {
            userId: userTwoID,
            username: "usertwo",
         },
         app.secret,
         { expiresIn: "1d" }
      ),
   },
   {
      _id: userThreeID,
      username: "userthree",
      password: "123",
      fullname: "user three",
      role: "MEMBER",
      belong: 1,
      project_working: [{ room: 1, team: 1 }],
      token: jwt.sign(
         {
            userId: userThreeID,
            username: "userthree",
         },
         app.secret,
         { expiresIn: "1d" }
      ),
   },
];

const findUser = async () => {
   const data = await UserModel.findOne({ username: users[2].username });
   console.log("function find USER :", data);
   return data;
};

export { users, findUser };
