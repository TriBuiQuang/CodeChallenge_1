import { promisify } from "util";
import dotenv from "dotenv";
dotenv.config();
import client from "../../helpers/init_redis.js";

let getResult, setResult;

if (process.env.NODE_ENV !== "test") {
   const GET_ASYNC = promisify(client.get).bind(client);
   const SET_ASYNC = promisify(client.set).bind(client);
   /**
    * For get data from redis
    * @param {string} name (required)
    */
   getResult = async (name) => await GET_ASYNC(name);

   /**
    * For set data to redis
    * @param {string} name (required)
    * @param {data} data (required)
    * @param {number} time (optional)
    */
   setResult = async (name, data, time = 300) => await SET_ASYNC(name, JSON.stringify(data), "EX", time);
} else {
   getResult = async (name) => null;
   getResult = async (name) => null;
}
export { getResult, setResult };
