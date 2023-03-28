import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import apiRouter from '../routers';
// import { invalidRouteHandlerRequestHandler } from '../errorHandlers';

dotenv.config();
const app = express();

app.set('port', process.env.PORT || 443);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

// app.use(invalidRouteHandlerRequestHandler);
// app.use((err, req, res, next) => {
//   res.locals.message = err.message;
//   res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
//   res.status(err.status || 500);
//   res.end();
// });

export default app;
