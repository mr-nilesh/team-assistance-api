// @ts-ignore
import cookieParser = require('cookie-parser');
// @ts-ignore
import express = require('express');
// @ts-ignore
import logger = require('morgan');
import path = require('path');
import BaseRouter from './routes';
import mongoose = require('mongoose');
// @ts-ignore
import bodyParser = require('body-parser');

const GLOBAL_VARS:any = global;
// Init express
const app = express();

app.use(bodyParser.json({limit: '10mb'}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
app.use((req: any, res: any, next: any) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// Add middleware/settings/routes to express.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', BaseRouter);

mongoose.connect('mongodb://localhost:27017/team-assistance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(
  (data: any) => {
    console.log('Successfully connected to Mongo.');
  }
);

mongoose.set('useFindAndModify', false);

/**
 * Point express to the 'views' directory. If you're using a
 * single-page-application framework like react or angular
 * which has its own development server, you might want to
 * configure this to only serve the index file while in
 * production mode.
 */
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));
// app.get('*', (req: Request, res: Response) => {
//     res.sendFile('index.html', {root: viewsDir});
// });

// Export express instance
export default app;
