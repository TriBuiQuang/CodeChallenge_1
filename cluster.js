import cluster from "cluster";
import os from "os";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
// redis
console.log("env", process.env.NODE_ENV, process.env.NODE_ENV !== "test");
if (process.env.NODE_ENV !== "test") {
   await import("./helpers/init_redis.js");
}

// database
import db from "./config/database.js";

// Routes
import IndexRoute from "./api/routes/index.js";

if (cluster.isMaster) {
   console.log("this is the master process : ", process.pid);

   // Count the machine's CPUs
   const cpuCount = os.cpus().length;

   // Create a worker for each CPU
   for (let i = 0; i < cpuCount; i += 1) {
      cluster.fork();
   }

   // Listen for dying workers
   cluster.on("exit", function () {
      cluster.fork();
   });
} else {
   const app = express();
   const port = process.env.PORT || 3000;
   // Listen to connection
   app.listen(port, () => {});

   app.use((req, res, next) => {
      res.append("Access-Control-Allow-Origin", "*");
      res.append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authentication");
      res.append("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      next();
   });

   app.use(bodyParser.urlencoded({ extended: false }));
   app.use(bodyParser.json());

   try {
      await mongoose.connect(`mongodb://mongo/${db.database}`, {
         useUnifiedTopology: db.config.useUnifiedTopology,
         useNewUrlParser: db.config.useNewUrlParser,
      });
   } catch (error) {
      console.log(error);
   }

   mongoose.set("useCreateIndex", db.config.useCreateIndex);
   mongoose.set("useFindAndModify", db.config.useFindAndModify);

   // v1: API version 1 => index Routes folder
   app.use("/api/v1/", IndexRoute);
}
