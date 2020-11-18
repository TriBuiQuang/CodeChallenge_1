import mongoose from "mongoose";

const userSchema = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   username: {
      type: String,
      required: true,
      index: true,
      unique: true,
      sparse: true,
   },
   fullname: { type: String, required: true },
   password: { type: String, required: true },
   role: { type: String, required: true }, // DIRECTOR, MANAGER, MEMBER
   belong: { type: Number, required: false, default: null }, // room 1,2,3,4
   project_working: { type: Array, default: false }, // team project user working [1,2,3,4,5]
});

export default mongoose.model("User", userSchema, "User");
