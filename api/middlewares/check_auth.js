import jwt from "jsonwebtoken";
import app from "../../config/app.js";

const check_auth = (req, res, next) => {
   try {
      const token = req.headers.authentication;
      const decode = jwt.verify(token, app.secret);

      req.auth = decode;
   } catch (error) {
      return res.status(401).json({ status: 401, message: "This user does not have permission to do this !!!" });
   }
   next();
};

export default check_auth;
