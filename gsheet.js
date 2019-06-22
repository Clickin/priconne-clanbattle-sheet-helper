const {google} = require('googleapis');

/**@class sheet manipulation*/
class sheetMan {
  /**
   * constructor description
   * @param {google.auth.OAuth2} cred oauth2 cred
   * @param {String} sheet_url google sheet url
   * @param {String} date YYYY-MM-DD date string
   * @param {String} list list of damage ex: 클릭 니들크리퍼 123456
   * 
  */ 
  constructor (cred, sheet_url, date, list) {
    this.sheets = google.sheets({
      version: 'v4',
      auth: cred,
    });
    this.spreadsheetId = new RegExp("/spreadsheets/d/([a-zA-Z0-9-_]+)").exec(sheet_url)[1];
    const datestring = date.split('-')
    this.date = parseInt(datestring[1]) + '월' + parseInt(datestring[2]) + '일'
    /**
     * user input damage list
     * @type {Array<Object<String, String, String>>} list
     */
    this.list = []
    this.merged = []
    for (let v of list.split(/\r?\n/).reverse()) {
      const parsedArr = v.split(' ')
      this.list.push({
        name: parsedArr[0],
        boss: parsedArr[1],
        damage: parsedArr[2]
      })
    }
    this.updateColors = this.updateColors.bind(this)
    this.updateValues = this.updateValues.bind(this)
  }

  /**
   * 
   * 
   */
  getColors() {
    this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      includeGridData: true,
      ranges: "색지정!A2:A6"
    }, (err, res) => {
      if (err) {
        throw err
      }
      else {
        /**
         * @type {Map<string, string>} mapped color with boss name
         */
        let colorMap = new Map()
        for (let obj of res.data.sheets[0].data[0].rowData) {
          colorMap.set(obj.values[0].formattedValue, obj.values[0].userEnteredFormat.backgroundColor)
        }
        this.updateColors(colorMap)
      }
    })
  }
  /**
   * 
   * 
   */
  getCurrentValues() {
    /*if (this.list[0].name === '' || this.list[0].boss === 'undefined' || this.list[0].damage === 'undefined') {
      throw '값을 입력해주세요!'
    }*/
    this.sheets.spreadsheets.values.batchGet({
      spreadsheetId: this.spreadsheetId,
      majorDimension: 'ROWS',
      ranges: this.date + '!A2:E31'
    }, (err, res) => {
      if (err) {
        throw err
      }
      else {
        this.updateValues(res.data.valueRanges[0].values)
      }
    })
    
  }
  /**
   * @param {Array<Array<String>>} originalValues array of original value from google sheet
   * 
   */
  updateValues(originalValues) {
    let arr = originalValues
    for (let row of arr) {
      for (let item of this.list) {
        if (row.includes(item.name) && !row.includes(item.damage) && !row.includes('') && row.length < 5) {
          row.push(item.damage)
        }
      }
    }
    this.merged = arr
    this.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      resource: {
        data: [
          {
            majorDimension: "ROWS",
            range: this.date + "!A2:E31",
            values: arr
          }
        ],
        valueInputOption: "USER_ENTERED"
      }
    }, (err, res) => {
      if (err) {
        throw err
      }
      else {
        console.log(res)
      }
    })
  }
  /**
   * 
   * @param {Map<string, string>} colors mapped color with boss name
   */
  updateColors(colors) {
    this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      ranges: this.date
    }, (err, res) => {
      if (err) {
        throw err
      }
      else {
        const sheetId = res.data.sheets[0].properties.sheetId
        let request = []
        this.merged.forEach((row, i) => { // rowindex == i + 1
          row.forEach((cell, j) => { // columnindex == j
            for (let item of this.list) {
              if (item.damage === cell) {
                request.push({
                  repeatCell: {
                    range: {
                      sheetId: sheetId,
                      startRowIndex: (i+1),
                      endRowIndex: (i+2),
                      startColumnIndex: j,
                      endColumnIndex: (j+1)
                    },
                    cell: {
                      userEnteredFormat: {
                        backgroundColor: colors.get(item.boss)
                      }
                    },
                    fields: 'userEnteredFormat'
                  }
                })
              }
            }
          })
        })
        this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          resource: {
            requests: request,
            includeSpreadsheetInResponse: false
          }
        }, (error, response) => {
          if (error) {
            throw error
          }
          else {
            console.log(response)
          }
        })
      }
    })
  }

  update() {
    this.getCurrentValues()
    this.getColors()
  }

}

module.exports = sheetMan