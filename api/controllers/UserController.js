import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
// middleware
import logger from "../middlewares/logger.js";
import { getResult, setResult } from "../middlewares/redis.js";

// database
import User from "../models/UserModel.js";
// Constant
import app from "../../config/app.js";

const Registration = async (req, res) => {
   try {
      logger.info("Start Registration");
      const { body } = req;
      let role = "";
      const position = ["DIRECTOR", "MANAGER", "MEMBER"];

      if (!body.role) role = "MEMBER";
      else role = body.role.toUpperCase();

      if (!body.password || !body.username || !body.fullname || !position.includes(role) || (role === "MEMBER" && !body.team))
         return res.status(400).json({ message: "Invalid data !!!" });

      // Check user exist
      const userExist = await User.findOne({ username: body.username });
      if (userExist) return res.status(400).json({ message: "User exists !!!" });
      // Create new User
      let user = new User({ _id: mongoose.Types.ObjectId() });

      user.username = body.username;
      user.fullname = body.fullname;
      user.password = bcrypt.hashSync(body.password, 10);
      user.role = role;
      if (role !== "DIRECTOR") {
         user.belong = body.belong ? body.belong : null;
         user.project_working = body.belong && role === "MEMBER" ? [{ room: body.belong, team: body.team }] : [];
      }

      await user.save();
      logger.info("Stop Registration");

      return res.status(200).json({ message: "REGISTER_SUCCESS" });
   } catch (error) {
      logger.error("Error Registration " + error);

      return res.status(500).json({ message: error });
   }
};

const Login = async (req, res) => {
   try {
      logger.info("Start Login");
      const { body } = req;

      if (!body.password) return res.status(400).json({ message: "Invalid data !!!" });

      const userExist = await User.findOne({ username: body.username });

      if (userExist.length < 1) return res.status(401).json({ message: "User is not exists !!!" });

      const match = await bcrypt.compare(req.body.password, userExist.password);

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

const DataTree = async (req, res) => {
   try {
      logger.info("Start DataTree");
      let data = [];
      const replyDataTree = await getResult("DataTree");
      if (replyDataTree) data = JSON.parse(replyDataTree);
      else {
         const tree = await User.find({ $or: [{ role: "DIRECTOR" }, { role: "MANAGER" }] }, { fullname: 1, role: 1, belong: 1 }).sort({ role: 1 });

         let tree_team = await User.aggregate([{ $match: { role: "MEMBER" } }, { $group: { _id: "$project_working" } }]);

         tree_team = tree_team.map((value) => {
            let new_value = value._id[0];
            value = { belong: new_value.room, team: new_value.team, role: "TEAM" };
            return value;
         });

         data = tree.concat(tree_team);
         await setResult("DataTree", data);
      }
      logger.info("Stop DataTree");

      return res.status(200).json({ data: data });
   } catch (error) {
      logger.error("Error DataTree " + error);

      return res.status(500).json({ error: error });
   }
};

const DataTeamMember = async (req, res) => {
   let { limit, offset, belong } = req.query;
   limit = parseInt(limit);
   offset = parseInt(offset);
   if (isNaN(limit) === true) limit = 20;
   if (isNaN(offset) === true) offset = 0;
   if (!belong) return res.status(400).json({ message: "Invalid data !!!" });

   try {
      logger.info("Start DataTeamMember");

      const data = await User.find(
         { role: "MEMBER", belong: belong, project_working: { $elemMatch: { room: 1 } } },
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

export { Login, Registration, Profile, ChangePassword, DataTree, DataTeamMember };
