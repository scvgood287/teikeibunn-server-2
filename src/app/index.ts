import express from 'express';
import cors from 'cors';
import apiRouter from '../routers';
import { initialize } from '../utils';
// import { invalidRouteHandlerRequestHandler } from '../errorHandlers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 443);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initialize();

app.use('/api', apiRouter);

// app.use(invalidRouteHandlerRequestHandler);
// app.use((err, req, res, next) => {
//   res.locals.message = err.message;
//   res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
//   res.status(err.status || 500);
//   res.end();
// });

export default app;
