var express = require('express');
var router = express.Router();
const {google} = require('googleapis');
const fs = require('fs')
const path = require('path')

const keyfile = path.join(__dirname, 'client_secret.json');
const keys = JSON.parse(fs.readFileSync(keyfile));

const oauth2Client = new google.auth.OAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris[0]
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
  res.render('index', { google: url });
});

module.exports = router;
