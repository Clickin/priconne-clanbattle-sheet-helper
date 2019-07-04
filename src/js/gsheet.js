"use strict";

import { google } from 'googleapis';
import "core-js/stable";
import "regenerator-runtime/runtime";


/**
 * @typedef {string[][]} sheetValues google spreadsheet data about ranges
 */

/**
 * @typedef {Object} infoData JSON about bosses and last updated value
 * @property {sheetValues} boss array of boss ref and name pair
 * @property {string} lastValue last updated value
 */

/**
 * @typedef {Object} backgroundColor RGB data of background color
 * @property {string|number} red
 * @property {string|number} green
 * @property {string|number} blue 
 */

/**
 * @typedef {Object} updateValuesData JSON about user input
 * @property {string} name user name
 * @property {string|number} boss boss reference
 * @property {string|number} damage damage done by user
 */

/**
 * @typedef {Map<string|numer, backgroundColor>} colorMap map key:boss ref value:color
 */

/**
 * @typedef {Map<string, string>} userMap map key:user ref value:user name
 */

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
      throw new Error(err)
    } 
  }

  /**
   * @description get last updated value from sheet
   * @returns {GaxiosResponse<sheets_v4.Schema$ValueRange>} google sheet api POST response about last updated value
   */
  async getLastValue() {
    try {
      const data = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.date + "!J2",
        majorDimension: "ROWS"
      })
      return data
    } catch (err) {
      throw new Error(err)
    }
  }
  /**
   * @description fetch boss information and last updated value
   * @returns {infoData}
   */
  async fetch() {
    try {
      const bossPOST = await this.getBosses()
      const lastPOST = await this.getLastValue()
      const bossArray = bossPOST.data.values
      const lastValue = lastPOST.data.values[0][0]

      return {
        boss: bossArray,
        lastValue: lastValue
      }

    } catch (err) {
      throw new Error(err)
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
   * @param {infoData} boss 
   * @property {Array.<updateValuesData>} this.list
  */ 
  constructor (cred, sheetUrl, targetDate, damageList, order, boss) {
    super(cred, sheetUrl, targetDate)
    
    this.list = []
    this.merged = []
    this.boss = boss
    const userInput = order === "downward" ? damageList.split(/\r?\n/).reverse() : damageList.split(/\r?\n/)
    for (let v of userInput) {
      const parsedArr = v.trim().split(' ')
      this.list.push({
        name: parsedArr[0],
        boss: this.boss.ref,
        damage: parsedArr[1]
      })
    }
    this.updateColors = this.updateColors.bind(this)
    this.updateValues = this.updateValues.bind(this)
  }

  /**
   * @description get color of boss and map corresponding
   * @returns {colorMap} map of boss ref and background color
   */
  async getColors() {
    const res = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      includeGridData: true,
      ranges: "색지정!A2:A6" 
    }) // get color setted at A2:A6
    const data = await res.data.sheets[0].data[0].rowData
    let colorMap = new Map()
    for (let row of data) {
      colorMap.set(row.values[0].formattedValue, row.values[0].userEnteredFormat.backgroundColor)
    }
    return colorMap
  }

  /**
   * @description update colors to target date sheet
   * @param {sheetValues} merged merged value of orignal values and updated values
   * @param {colorMap} colorMap
   */
  async updateColors(colorMap, merged) {
    const res = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      ranges: this.date
    })
    const sheetId = await res.data.sheets[0].properties.sheetId //because batchUpdate for sheet needs sheet id and index number range notation
    
    let request = []
    merged.forEach((row, i) => { // rowindex == i + 1
      row.forEach((cell, j) => { // columnindex == j
        for (let item of this.list) {
          if (item.damage === cell) {
            //console.log(item.boss)
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
                    backgroundColor: colorMap.get('' + item.boss)
                  }
                },
                fields: 'userEnteredFormat'
              }
            })
          }
        }
      })
    })
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
      throw new Error(err)
    }
  }

  /**
   * @description get current value of target date sheet
   * @returns {sheetValues} array of original value from google sheet
   */
  async getCurrentValues() {
    
    const values = await this.sheets.spreadsheets.values.batchGet({
      spreadsheetId: this.spreadsheetId,
      majorDimension: 'ROWS',
      ranges: this.date + '!A2:F31'
    })
    //console.log(values)
    return values.data.valueRanges[0].values
    
    
  }
  /**
   * @description update values to target date sheet
   * @param {sheetValues} originalValues array of original value from google sheet
   * @returns {sheetValues} merged array of orignal value and user input
   */
  async updateValues(originalValues) {

    let merged = originalValues
    for (let row of merged) {
      for (let item of this.list) {
        if (row[0][0].includes(item.name) && !row.includes(item.damage) && !row.includes('') && row.length < 6) {
          row.push(item.damage)
        }
      }
    }
    const userMap = await this.getUserMap()
    try {
      const lastEnterd = this.list[this.list.length-1]
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
              values: Array(Array(userMap.get(lastEnterd.name) + " 님이 " + this.boss.name + " 몬스터를 " + lastEnterd.damage + "까지"))
            }
          ],
          valueInputOption: "USER_ENTERED"
        }
      })
      return merged
      //console.log(res)
    } catch (err) { 
      throw new Error(err)
    }
  }
  /**
   * @description get user reference and their name and map corresponding
   * @returns {userMap} returns mapped data
  */
  async getUserMap() {
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
  }
  /**
   * @description update sheet using data retreived from POST
   */
  async update() {
    if (this.list[0].name === '' || this.list[0].boss === 'undefined' || this.list[0].damage === 'undefined') {
      throw new Error('값을 입력해주세요!')
    }
    
    try {
      const current = await this.getCurrentValues()
      const merged = await this.updateValues(current)
      const colorMap = await this.getColors()
      this.updateColors(colorMap, merged)
    } catch (err) {
      throw new Error (err)
    }
    
  }

}

export {
  infoSheet,
  updateSheet
}