"use strict";

import createError from 'http-errors';
import express, { json, urlencoded, static as _static } from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import favicon from 'serve-favicon';
import { json as _json, urlencoded as _urlencoded } from 'body-parser';

import indexRouter from '../routes/index';
import oauthRouter from '../routes/oauth';


const app = express();

// view engine setup
app.set('views', join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(_static(join(__dirname, '../public')));
app.use(favicon(join(__dirname, '../public', 'favicon.ico')))
app.use(_json({limit: '50mb', type: 'application/json'}));       // to support JSON-encoded bodies
app.use(_urlencoded({
  parameterLimit: 100000,
  limit: '50mb',     // to support URL-encoded bodies
  extended: true
})); 


app.use('/', indexRouter);
app.use('/oauth', oauthRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
