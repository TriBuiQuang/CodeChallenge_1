import redis from "redis";
import dotenv from "dotenv";
dotenv.config();
let client;
if (process.env.NODE_ENV !== "test") {
   client = redis.createClient({
      port: 6379,
      host: "redis",
   });

   client.on("connect", () => {
      console.log("Client connected to redis...");
   });

   client.on("ready", () => {
      console.log("Client connected to redis and ready to use...");
   });

   client.on("error", (err) => {
      console.log(err.message);
   });

   client.on("end", () => {
      console.log("Client disconnected from redis");
   });

   process.on("SIGINT", () => {
      client.quit();
   });
   console.log("go here in if  in init redis");
} else {
   client = null;
}

export default client;
