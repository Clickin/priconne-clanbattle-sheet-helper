"use strict";

import { google } from 'googleapis';
import "core-js/stable";
import "regenerator-runtime/runtime";
const moment = require('moment');

/**
 * @typedef {string[][]} sheetValues google spreadsheet data about ranges
 */


/**
 * @typedef {Object} infoData JSON about bosses and last updated value
 * @property {sheetValues} bossArr array of boss ref and name pair
 * @property {string} lastValue last updated value
 * @property {string[]} message message about errors
 */

/**
 * @typedef {Object} userSelectedBoss JSON about user selected boss
 * @property {string|number} ref reference of user selected boss
 * @property {string} name name of user selected boss
 */

/**
 * @typedef {Object} backgroundColor RGB data about background color, R(0~1)G(0~1)B(0~1) format
 * @property {string|number} red
 * @property {string|number} green
 * @property {string|number} blue 
 */

/**
 * @typedef {Object} updateValuesData JSON about user input
 * @property {string} name user name
 * @property {string|number} bossRef boss reference
 * @property {string|number} damage damage done by user
 * @property {boolean} defeat user defeated boss boolean
 */

/**
 * @typedef {Map<string|number, backgroundColor>} colorMap map key:boss ref value:color
 */

/**
 * @typedef {Map<string, string>} userMap map key:user ref value:user name
 */

/**
 * @typedef {Object} updateColorRequest JSON about color of user input
 * @property {Object} repeatCell color request JSON about actual cell
 */

/**
 * @typedef {Object} repeatCell color request JSON about actual cell
 * @property {Object} range The range to repeat the cell in
 * @property {Object} cell grid information about cell
 * @property {string} fields The fields that should be updated
 */

/**
 * @typedef {Object} range The range to repeat the cell in
 * @property {string} sheetId sheetId
 * @property {number} startRowIndex start index of row 
 * @property {number} endRowIndex end index of row
 * @property {number} startColumnIndex start index of column
 * @property {number} endColumnIndex end index of column
 */

/**
 * @typedef {Object} userEnteredFormat grid information about user enterd data
 * @property {Object} backgroundColor R G B data about background color, R(0~1)G(0~1)B(0~1) format
 */




/**@class custom no spreadsheet error */ 
class SpreadsheetNotExistError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this)
    this.name = "SpreadsheetNotExistError"
    this.message = "There is no spreadsheet has such name"
  }
}

/**@class custom no value error */
class GetValueError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this)
    this.name = "GetValueError"
    this.message = "Failed to get value from the sheet"
  }
}

/**@class cutome failed on update error */
class UpdateError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this)
    this.name = "UpdateError"
    this.message = "Failed to update value at the sheet"
  }
}

class InvalidSpreadsheetIdError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this)
    this.name = "InvalidSpreadsheetIdError"
    this.message = "Entered invalid spreadsheet ID"
    this.code = 400
  }
}

/**@class sheet interface */
class gsheet {
  /**
   * @param {OAuth2Client} cred oauth2 credential
   * @param {string} sheetUrl google sheet url
   * @param {string} targetDate YYYY-MM-DD format date string
   */
  constructor (cred, sheetUrl, targetDate) {
    this.cred = cred
    this.sheets = google.sheets({
      version: 'v4',
      auth: cred,
    });
    this.spreadsheetId = new RegExp("/spreadsheets/d/([a-zA-Z0-9-_]+)").exec(sheetUrl)[1];
    const datestring = targetDate.split('-')
    this.date = parseInt(datestring[1]) + '월' + parseInt(datestring[2]) + '일'
  }

}
/** 
 * @class sheet information about boss and last element
 * @extends gsheet
 */

class infoSheet extends gsheet
{
  /**
   * @param {OAuth2Client} cred oauth2 cred
   * @param {string} sheetUrl google sheet url
   * @param {string} targetDate YYYY-MM-DD date string
   */
  constructor(cred, sheetUrl, targetDate) {
    super(cred, sheetUrl, targetDate)
  }
  /**
   * @description get boss reference and it's name
   * @returns {GaxiosResponse<sheets_v4.Schema$ValueRange>} google sheet api POST response about boss information
   */
  async getBosses() {
    try {
      const data = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "색지정!A2:B6", 
        majorDimension: "ROWS"
      })
      return data
    } catch (err) {
      throw new GetValueError(err)
    } 
  }

  /**
   * @description get last updated value from sheet
   * @returns {GaxiosResponse<sheets_v4.Schema$ValueRange>} google sheet api POST response about last updated value
   */
  async getLastValue() {
    try {
      const post = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.date + "!J2",
        majorDimension: "ROWS"
      })
      return post.data.values[0][0]
    } catch (err) {
      throw new GetValueError(err)
    }
  }
  /**
   * @description check spreadsheet existance
   * @returns {boolean} if spreadsheet id is correct and corresponding sheet exists, retuns true
   */
  async checkSpreadsheet() {
    try {
      const res = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      })
      let check = []
      for (let sheet of res.data.sheets) {
        check.push(sheet.properties.title)
      }
      if (check.includes(this.date)) {
        return true
      }
    } catch (err) {
      //console.log(err)
      if (err.code == 404) {
        throw new InvalidSpreadsheetIdError(err)
      }
      else if (err instanceof ReferenceError) {
        throw new SpreadsheetNotExistError(err)
      }
      else {
        throw new Error(err)
      }
    }
  }

  /**
   * @description fetch boss information and last updated value
   * @returns {infoData}
   */
  async fetch() {
    let message = []
    let spreadsheetCheck = false
    try {
      spreadsheetCheck = await this.checkSpreadsheet()
    } catch (err) {
      if (err instanceof InvalidSpreadsheetIdError) {
        message.push("잘못된 시트 URL")
      }
      else if (err instanceof SpreadsheetNotExistError) {
        message.push("해당 날짜 개별 시트 없음")
      }
      else {
        message.push("API 키 만료로 재로그인 바람")
      }
    }
    /**
     * @type {sheetValues}
     */
    let bossArray = [[]]
    /**
     * @type {string}
     */
    let lastValue
    if (spreadsheetCheck) {
      try {
        const bossPOST = await this.getBosses()
        bossArray = bossPOST.data.values
      } catch (err) {
        if (err instanceof GetValueError) {
          bossArray = [["보스 정보를 입력해주세요"]]
          message.push("보스 정보 미입력")
        }
      }

      try {
        lastValue = await this.getLastValue()
      } catch (err) {
        if (err instanceof GetValueError) {
          lastValue = "마지막 입력값이 존재하지 않습니다"
          message.push("마지막 입력값 없음")
        }
      }
      return {
        bossArr: bossArray,
        lastValue: lastValue,
        message: message
      }    
    }
    else {
      return {
        message: message
      }
    }
    
  }
}
/** 
 * @class sheet manipulation
 * @extends gsheet
*/
class updateSheet extends gsheet {
  /**
   * constructor description
   * @param {string} order order of damageList
   * @param {string} damageList list of damage ex: 클릭 123456
   * @param {userSelectedBoss} bossData
  */ 
  constructor (cred, sheetUrl, targetDate, damageList, order, bossData) {
    super(cred, sheetUrl, targetDate)
    
    /**
     * @type {Array.<updateValuesData>}
     */
    this.list = []
    /**
     * @type {userSelectedBoss}
     */
    this.userBoss = bossData
    const userInput = order === "downward" ? damageList.split(/\r?\n/).reverse() : damageList.split(/\r?\n/)
    for (let v of userInput) {
      const parsedArr = v.trim().split(' ')
      this.list.push({
        name: parsedArr[0],
        bossRef: this.userBoss.ref,
        damage: parsedArr[1],
        defeat: (parsedArr[2] !== undefined) ? true : false
      })
    }
    this.updateColors = this.updateColors.bind(this)
    this.updateValues = this.updateValues.bind(this)
  }

  /**
   * @description function that makes request object about color 
   * @param {string} sheetId individual spreadsheet id
   * @param {number} rowIndex start row index of cell
   * @param {number} columnIndex start column index of cell
   * @param {backgroundColor} backgroundColor background color of cell
   * @returns {repeatCell}
   */
  async makeColorRequestObject(sheetId, rowIndex, columnIndex, backgroundColor) {
    return {
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: (rowIndex+1),
          endRowIndex: (rowIndex+2),
          startColumnIndex: columnIndex,
          endColumnIndex: (columnIndex+1)
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: backgroundColor
          }
        },
        fields: 'userEnteredFormat'
      }
    }
  }

  /**
   * @description get color of boss and map corresponding
   * @returns {colorMap} map of boss ref and background color
   */
  async getColors() {
    try {
      const res = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        includeGridData: true,
        ranges: "색지정!A2:A6" 
      }) // get color setted at A2:A6
      const data = res.data.sheets[0].data[0].rowData
      let colorMap = new Map()
      for (let row of data) {
        colorMap.set(row.values[0].formattedValue, row.values[0].userEnteredFormat.backgroundColor)
      }
      return colorMap
    } catch (err) {
      throw new GetValueError(err)
    }
  }
  /**
   * @description make timestamp string
   * @param {string} timezone 00:00 format timezone string
   * @returns {string} parsed string of hours and minutes
   */
  async makeTimestamp(timezone) {
    const momentObj = new moment().utcOffset(timezone)
    let hour = String(momentObj.hours())
    if (hour.length < 2) {
      hour = '0' + hour
    }
    let minute = String(momentObj.minutes())
    if (minute.length < 2) {
      minute = '0' + minute
    }
    return '[' + hour + ':' + minute + ']'
  }


  /**
   * @description update colors to target date sheet
   * @param {sheetValues} merged merged value of orignal values and updated values
   * @param {colorMap} colorMap map key:boss ref value:color
   */
  async updateColors(colorMap, merged) {
    const res = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      ranges: this.date
    })
    const sheetId = await res.data.sheets[0].properties.sheetId //because batchUpdate for sheet needs sheet id and index number range notation
    /**
     * request array of repeat cell
     * @type {repeatCell[]} 
     */
    
    let request = []
    
    for (let [i, row] of merged.entries()) {
      for (let [j, cell] of row.entries()) {
        for (let item of this.list) {
          if (item.damage === cell) {
            request.push(await this.makeColorRequestObject(sheetId, i, j, colorMap.get('' + item.bossRef)))
          }
        }
      }
    }
    
    try {
      const answer = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: request,
          includeSpreadsheetInResponse: false
        }
      })
      //console.log(answer)
    } catch (err) {
      throw new UpdateError(err)
    }
  }

  /**
   * @description get current value of target date sheet
   * @returns {sheetValues} array of original value from google sheet
   */
  async getCurrentValues() {
    try {
      const values = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId: this.spreadsheetId,
        majorDimension: 'ROWS',
        ranges: this.date + '!A2:F31'
      })
      //console.log(values.data.valueRanges[0].values)
      return values.data.valueRanges[0].values
    } catch (err) {
      throw new GetValueError(err)
    }
  }
  /**
   * @description update values to target date sheet
   * @param {sheetValues} originalValues array of original value from google sheet
   * @returns {sheetValues} merged array of orignal value and user input
   */
  async updateValues(originalValues) {

    let merged = originalValues
    
    const defeatPOST = await this.sheets.spreadsheets.values.batchGet({
      spreadsheetId: this.spreadsheetId,
      majorDimension: 'COLUMNS',
      ranges: this.date + '!I2:I31'
    })
    /**
     * @type {string[][]} user that defeated boss column
     */
    let defeatList = defeatPOST.data.valueRanges[0].values
    for (let [i, row] of merged.entries()) {
      for (let item of this.list) {
        if (row[0][0].includes(item.name) && !row.includes(item.damage) && !row.includes('') && row.length < 6) {
          row.push(item.damage)
          if (item.defeat) {
            defeatList[0][i] = (row.length - 3) + "타 " + this.userBoss.name + " 격파"
          }
        }
      }
    }
    //console.log(defeatList)
    const userMap = await this.getUserMap()
    try {
      const lastEntered = this.list[this.list.length-1]
      const lastEnterdString = await this.makeTimestamp("+09:00") + userMap.get(lastEntered.name) + " 님이 " + this.userBoss.name + " 몬스터를 " + lastEntered.damage + "까지"
      const res = await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          data: [
            {
              majorDimension: "ROWS",
              range: this.date + "!A2:F31",
              values: merged
            },
            {
              majorDimension: "ROWS",
              range: this.date + "!J2",
              values: Array(Array(lastEnterdString))
            },
            {
              majorDimension: "COLUMNS",
              range: this.date + "!I2:I31",
              values: defeatList
            }
          ],
          valueInputOption: "USER_ENTERED"
        }
      })
      return merged
      //console.log(res)
    } catch (err) { 
      throw new UpdateError(err)
    }
  }

  
  /**
   * @description get user reference and their name and map corresponding
   * @returns {userMap} returns mapped data
  */
  async getUserMap() {
    try {
      const values = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId: this.spreadsheetId,
        majorDimension: 'ROWS',
        ranges: this.date + '!A2:B31'
      })
      let userMap = new Map()
      for (let row of values.data.valueRanges[0].values) {
        userMap.set(row[0], row[1])
      }
      return userMap
    } catch (err) {
      throw new GetValueError(err)
    }
    
  }
  /**
   * @description update sheet using data retreived from POST
   * @returns {Object} Object contains message to user
   */
  async update() {
    if (this.list[0].name === '' || this.list[0].bossRef === 'undefined' || this.list[0].damage === 'undefined') {
      return {message: "값을 입력해주세요"}
    }
    
    try {
      const current = await this.getCurrentValues()
      const merged = await this.updateValues(current)
      const colorMap = await this.getColors()
      this.updateColors(colorMap, merged)
      return {message: "업로드 완료"}
    } catch (err) {
      if (err instanceof TypeError) {
        return {message: "해당날짜 시트 데이터 미작성"}
      }
      else {
        return {message: "문제가 발생했습니다. 로그인부터 다시 시도해주세요"}  
      }
    }
    
  }

}

export {
  infoSheet,
  updateSheet
}