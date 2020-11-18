import express from 'express';
import UserRoute from './UserRoute.js';
const app = express();

// This is router global.
app.use('/user/', UserRoute);

export default app;
