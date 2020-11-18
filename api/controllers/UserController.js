import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
// middleware
import logger from "../middlewares/logger.js";
import { getResult, setResult } from "../middlewares/redis.js";

// database
import User from "../models/UserModel.js";

// Constant
import app from "../../config/app.js";
import constant from "../../config/constant.js";

/**
 * Registration User API
 * @param {*} username (required)
 * @param {*} password (required)
 * @param {*} fullname (required)
 * @param {*} role (optional): must be 'director' or 'manager' or 'member'
 * @param {*} belong (optional): must have if role is 'manager' or 'member'
 * @param {*} team (optional): must have if role is  'member'
 * @return {*}
 */
const Registration = async (req, res) => {
   try {
      logger.info("Start Registration");
      const { body } = req;
      let role = "";
      const position = [constant.DIRECTOR, constant.MANAGER, constant.MEMBER];

      if (!body.role) role = constant.MEMBER;
      else role = body.role.toUpperCase();

      if (
         !body.password ||
         !body.username ||
         !body.fullname ||
         !position.includes(role) ||
         (role === constant.MEMBER && !body.team) ||
         (role !== constant.DIRECTOR && !body.belong)
      )
         return res.status(400).json({ message: "Invalid data !!!" });

      // Check User exist
      const userExist = await User.findOne({ username: body.username });
      if (userExist) return res.status(400).json({ message: "User exists !!!" });
      // Check Manager exist
      if (role === constant.MANAGER) {
         const managerExist = await User.findOne({ belong: body.belong });
         if (managerExist) return res.status(400).json({ message: "Manager exists !!!" });
      }

      // Create new User
      let user = new User({ _id: body.id ? body.id : mongoose.Types.ObjectId() });

      user.username = body.username;
      user.fullname = body.fullname;
      user.password = bcrypt.hashSync(body.password, 10);
      user.role = role;
      if (role !== constant.DIRECTOR) {
         user.belong = body.belong;
         user.project_working = role === constant.MEMBER ? [{ room: body.belong, team: body.team }] : [];
      }

      await user.save();
      logger.info("Stop Registration");

      return res.status(200).json({ message: "REGISTER_SUCCESS" });
   } catch (error) {
      logger.error("Error Registration " + error);

      return res.status(500).json({ message: error });
   }
};

/**
 * User Login API
 * @param {*} username (required)
 * @param {*} password (required)
 * @return {*}
 */
const Login = async (req, res) => {
   try {
      logger.info("Start Login");
      const { body } = req;

      if (!body.password) return res.status(400).json({ message: "Invalid data !!!" });

      const userExist = await User.findOne({ username: body.username });

      if (userExist.length < 1) return res.status(401).json({ message: "User is not exists !!!" });

      const match = await bcrypt.compare(body.password, userExist.password);

      if (!match) return res.status(401).json({ message: "User or password is wrong !!!" });

      const token = jwt.sign(
         {
            userId: userExist._id,
            username: userExist.username,
         },
         app.secret,
         { expiresIn: "1d" }
      );

      logger.info("Stop Login");

      return res.status(200).json({ message: "LOGIN_SUCCESS", token: token });
   } catch (error) {
      logger.error("Error Login " + error);

      return res.status(500).json({ error: error });
   }
};

/**
 * Get user's profile API
 * @return {*}
 */
const Profile = async (req, res) => {
   try {
      logger.info("Start Profile");
      const Profile = await User.findById(req.auth.userId);

      logger.info("Stop Profile");

      return res.status(200).json({ data: Profile });
   } catch (error) {
      logger.error("Error Profile " + error);

      return res.status(500).json({ error: error });
   }
};

/**
 * Change user's password API
 * @param {*} password (required)
 * @param {*} new_password (required)
 * @return {*}
 */
const ChangePassword = async (req, res) => {
   try {
      logger.info("Start ChangePassword");
      const { password, new_password } = req.body;
      const user = await User.findById(req.auth.userId);

      const match = await bcrypt.compare(password, user.password);

      if (!match) return res.status(401).json({ success: false, status: 401, message: "Wrong password !!!" });
      if (user.length <= 0) return res.status(401).json({ success: false, status: 401, message: "Dont have this user !!!" });

      user.password = bcrypt.hashSync(new_password, 10);
      user.updated_at = Date.now();
      await user.save();

      logger.info("Stop ChangePassword");

      return res.status(200).json({ message: "Change password successfull" });
   } catch (error) {
      logger.error("Error ChangePassword " + error);

      return res.status(500).json({ error: error });
   }
};

/**
 * Get data tree of manager and directory and member
 * @return {*}
 */
const DataTree = async (req, res) => {
   try {
      logger.info("Start DataTree");
      let data = [];
      const replyDataTree = await getResult("DataTree");
      if (replyDataTree) data = JSON.parse(replyDataTree);
      else {
         const tree = await User.find({ $or: [{ role: constant.DIRECTOR }, { role: constant.MANAGER }] }, { fullname: 1, role: 1, belong: 1 }).sort({
            role: 1,
         });

         let tree_team = await User.aggregate([{ $match: { role: constant.MEMBER } }, { $group: { _id: "$project_working" } }]);

         tree_team = tree_team.map((value) => {
            let new_value = value._id[0];
            value = { belong: new_value.room, team: new_value.team, role: "TEAM" };
            return value;
         });

         data = tree.concat(tree_team);
         if (process.env.NODE_ENV !== "test") await setResult("DataTree", data);
      }
      logger.info("Stop DataTree");

      return res.status(200).json({ data: data });
   } catch (error) {
      logger.error("Error DataTree " + error);

      return res.status(500).json({ error: error });
   }
};

/**
 * Get data all member of 1 room
 * @param {*} limit (Number) : (default : 20) <= 1500
 * @param {*} offset (Number) : (default : 0)
 * @param {*} belong (required)
 * @return {*}
 */
const DataTeamMember = async (req, res) => {
   let { limit, offset, belong } = req.query;
   limit = parseInt(limit);
   offset = parseInt(offset);
   if (isNaN(limit) === true) limit = 20;
   if (isNaN(offset) === true) offset = 0;
   if (!belong || limit > 1500) return res.status(400).json({ message: "Invalid data !!!" });

   try {
      logger.info("Start DataTeamMember");

      const data = await User.find(
         { role: constant.MEMBER, belong: belong, project_working: { $elemMatch: { room: belong } } },
         { fullname: 1, role: 1, belong: 1, project_working: 1 }
      )
         .skip(offset)
         .limit(limit);

      logger.info("Stop DataTeamMember");

      return res.status(200).json({ data: data });
   } catch (error) {
      logger.error("Error DataTeamMember " + error);

      return res.status(500).json({ error: error });
   }
};

/**
 * Add exist member to the team
 * @param {*} id (required)
 * @param {*} belong (required)
 * @param {*} team (required)
 * @return {*}
 */
const AddMemberToTeam = async (req, res) => {
   let { id, belong, team } = req.body;

   if (!belong || !id || !team) return res.status(400).json({ message: "Invalid data !!!" });

   try {
      logger.info("Start AddMemberToTeam");

      const memberExist = await User.findOne({ _id: id, role: constant.MEMBER });
      if (!memberExist) return res.status(404).json({ message: "Member not exists !!!" });

      await User.updateOne({ _id: id }, { $push: { project_working: { room: belong, team: team } } });

      logger.info("Stop AddMemberToTeam");

      return res.status(200).json({ message: "UPDATED_SUCCESS" });
   } catch (error) {
      logger.error("Error AddMemberToTeam " + error);

      return res.status(500).json({ error: error });
   }
};

/**
 * remove exist member from the team(can't remove when member is belong to original team)
 * @param {*} id (required)
 * @param {*} belong (required)
 * @param {*} team (required)
 * @return {*}
 */
const RemoveMemberFromTeam = async (req, res) => {
   let { id, belong, team } = req.body;

   if (!belong || !id || !team) return res.status(400).json({ message: "Invalid data !!!" });

   try {
      logger.info("Start RemoveMemberFromTeam");

      const memberExist = await User.findOne({ _id: id, role: constant.MEMBER });
      if (!memberExist) return res.status(404).json({ message: "Member not exists !!!" });

      const memberBelong = await User.findOne({ _id: id, belong: belong, project_working: { $elemMatch: { room: belong, team: team } } });
      if (memberBelong) return res.status(400).json({ message: "Member is belong to this original team !!!" });

      await User.updateOne({ _id: id }, { $pull: { project_working: { room: belong, team: team } } });

      logger.info("Stop RemoveMemberFromTeam");

      return res.status(200).json({ message: "REMOVE_SUCCESS" });
   } catch (error) {
      logger.error("Error RemoveMemberFromTeam " + error);

      return res.status(500).json({ error: error });
   }
};

export { Login, Registration, Profile, ChangePassword, DataTree, DataTeamMember, AddMemberToTeam, RemoveMemberFromTeam };
