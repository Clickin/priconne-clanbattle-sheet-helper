# priconne-clanbattle-sheet-helper
update clan battle sheet easier

# About Authentication
**You should use OAuth2 Authentication to update google sheet with api v4**. 

# Instructions
If you aren't have client_scret.json or don't know about what it is, check [this instructions](https://analytify.io/get-client-id-client-secret-developer-api-key-google-developers-console-application/).

Please note that you should activate **Google Sheet API** rather than **Analytics API**

Get more information about google OAuth2 api, see [google's instructions](https://github.com/googleapis/google-api-nodejs-client)

If you are running at condition that cannot use readFile like heroku, you can simply remove readFile section and edit code below in *src/views/index.js* and *src/views/oauth.js*

**Before**
```
const oauth2Client = new google.auth.OAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris
);
```
**After**
```
const oauth2Client = new google.auth.OAuth2(
  "example_client_id",
  "example_client_secret",
  "http://example.com"
);
```

If you are not familar with A1 notation, check A1 notaion section at [google documentation](https://developers.google.com/sheets/api/guides/concepts) 

# Example sheet template
My sheet template looks like below
![boss reference](https://github.com/Clickin/priconne-clanbattle-sheet-helper/blob/master/examples/2019-07-04%2011%2025%2017.png)
![member damage sheet](https://github.com/Clickin/priconne-clanbattle-sheet-helper/blob/master/examples/2019-07-04%2011%2025%2027.png)

You can edit ranges which data saved and get information at src/js/gsheet.js 
