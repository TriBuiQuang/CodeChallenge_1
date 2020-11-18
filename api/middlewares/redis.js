import { promisify } from "util";
import client from "../../helpers/init_redis.js";

const GET_ASYNC = promisify(client.get).bind(client);
const SET_ASYNC = promisify(client.set).bind(client);

/**
 * For get data from redis
 * @param {string} name (required)
 */
const getResult = async (name) => await GET_ASYNC(name);

/**
 * For set data to redis
 * @param {string} name (required)
 * @param {data} data (required)
 * @param {number} time (optional)
 */
const setResult = async (name, data, time = 300) => await SET_ASYNC(name, JSON.stringify(data), "EX", time);

export { getResult, setResult };
