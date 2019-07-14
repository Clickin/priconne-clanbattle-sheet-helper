"use strict";

import { Router } from 'express';
const router = Router();
import { google } from 'googleapis';
import { infoSheet, updateSheet } from '../js/gsheet';
import { join } from 'path';
import { readFileSync } from 'fs';
import "core-js/stable";
import "regenerator-runtime/runtime";
import asyncHandler from 'express-async-handler';

// Create an oAuth2 client to authorize the API call
const keyfile = join(__dirname, 'client_secret.json');
const keys = JSON.parse(readFileSync(keyfile));

const oauth2Client = new google.auth.OAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris
);

/* GET users listing. */
router.get('/', asyncHandler(async (req, res) => {
  const code = req.query.code;
  try {
    const {tokens} = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    res.redirect('/oauth/upload')
  } catch (e) {
    throw new Error(e)
  }
}));

router.get('/upload', (req, res) => {
  res.render('input', {moment: require('moment')})
})
router.post('/upload', asyncHandler(async (req, res) => {
  const update = new updateSheet(oauth2Client, req.body.sheetUrl, req.body.targetDate, req.body.damageList, req.body.order, req.body.boss)
  try {
    const message = await update.update()
    res.json(message)
  } catch (err) {
    res.json(message)
  }
  
}))

router.get('/info', asyncHandler(async (req, res) => {
  
  const info = new infoSheet(oauth2Client, req.query.sheetUrl, req.query.targetDate)
  const data = await info.fetch()
  if (data.message.length == 0) {
    data.message.push("받아오기 완료")
  }
  res.json(data)
}))


export default router;
