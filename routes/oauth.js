var express = require('express');
var router = express.Router();
const { google } = require('googleapis')
const fs = require('fs')
const path = require('path');
const gsheet = require('../gsheet')
const moment = require('moment')


const keyfile = path.join(__dirname, 'client_secret.json');
const keys = JSON.parse(fs.readFileSync(keyfile));
const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

// Create an oAuth2 client to authorize the API call
const oauth2Client = new google.auth.OAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris[0]
)

/* GET users listing. */
router.get('/', (req, res) => {
  const code = req.query.code;
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) {
      console.error('Error getting oAuth tokens:')
      throw err
    }
    oauth2Client.credentials = tokens;
    res.redirect('/oauth/upload')
    
  });
});

router.get('/upload', (req, res) => {
  res.render('input', {moment: moment})
})
router.post('/upload', (req, res) => {
  
  const sheet = new gsheet(oauth2Client, req.body.sheet_url, req.body.current, req.body.list)
  try {
    sheet.update()
  } catch (e) {
    res.render(e)
  }
  
  res.send("완료!")
})

module.exports = router;
