import express from 'express';
import routesIndex from '../routes/user.route';
import bodyParser from 'body-parser';
import {config} from "dotenv";
config();
const app = express();

// Apply necessary middleware
app.use(bodyParser.json());
app.use(routesIndex);

export default app;
