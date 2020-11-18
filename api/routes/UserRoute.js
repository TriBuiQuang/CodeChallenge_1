import express from "express";

import check_auth from "../middlewares/check_auth.js";
import {
   Login,
   Registration,
   Profile,
   ChangePassword,
   DataTree,
   DataTeamMember,
   AddMemberToTeam,
   RemoveMemberFromTeam,
} from "../controllers/UserController.js";

const app = express();

app.post("/login", Login);
app.post("/registration", Registration);
app.get("/", check_auth, Profile);
app.put("/change-password", check_auth, ChangePassword);

app.get("/tree", check_auth, DataTree);
app.get("/team-member/", check_auth, DataTeamMember);
app.put("/add-member-to-team/", check_auth, AddMemberToTeam);
app.put("/remove-member-from-team/", check_auth, RemoveMemberFromTeam);

export default app;
