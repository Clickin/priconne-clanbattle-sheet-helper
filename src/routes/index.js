"use strict";

import { Router } from 'express';
const router = Router()
import { google } from 'googleapis';
import { join } from 'path';
import { readFileSync } from 'fs';

// Create an oAuth2 client to authorize the API call
const keyfile = join(__dirname, 'client_secret.json');
const keys = JSON.parse(readFileSync(keyfile));

const oauth2Client = new google.auth.OAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris
);


const scopes = [
  'https://www.googleapis.com/auth/spreadsheets'
];

const url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as a string
  scope: scopes
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { google: url, title: '프리코네 시트 입력기' });
});

export default router;
