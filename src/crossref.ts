/*
The MIT License (MIT)

Copyright 2020 Mao Tsunekawa

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

type Range = GoogleAppsScript.Spreadsheet.Range;
type Sheet = GoogleAppsScript.Spreadsheet.Sheet;
type URL = string
type XMLString = string

/* Type Definitions for Crossref Metadata API JSON Format
 * Ref. https://github.com/Crossref/rest-api-doc/blob/master/api_format.md
 */

namespace Crossref {

  export interface Affiliation {
    name: string
  }

  export interface Contributor {
    family: string
    given?: string
    ORCID?: URL
    authenticated_orcid?: boolean
    affiliation?: Affiliation[]
  }

  export interface Work {
    publisher: string
    title: string[]
    originalTitle?: string[]
    shortTitle?: string[]
    abstract?: XMLString
    referenceCount: number
    referencesCount: number
    isReferencedByCount: number
    source: 'crossref'
    prefix: string
    DOI: string
    URL: URL
    member: string
    type: string
    created: _Date
    deposited: _Date
    indexed: _Date
    issued?: PartialDate
    posted?: PartialDate
    accepted?: PartialDate
    subtitle?: string[]
    containerTitle?: string[]
    shortContainerTitle?: string[]
    groupTitle?: string
    issue?: string
    volume?: string
    page?: string
    articleNumber?: string
    publishedPrint?: PartialDate
    publishedOnline?: PartialDate
    subject?: string[]
    ISSN?: string[]
    issnType?: ISSNWithType[]
    ISBN?: string[]
    archive: string[]
    license: License[]
    funder: Funder[]
    author?: Contributor[]
  }

  export interface Funder {
    name: string
    DOI?: string
    award?: string[]
    doiAssertedBy?: string
  }

  export interface Assertion {
    name: string
    value: string
    URL?: URL
    explanation?: URL
    label?: string
    order?: number
    group?: AssertionGroup
  }

  export interface AssertionGroup {
    name: string
    label?: string
  }

  export interface License {
    contentVersion: string
    delayInDays: number
    start: PartialDate
    URL: URL
  }
  export interface _Date {
    dateParts: [number, number, number]
    timestamp: number
    dateTime: string
  }

  export interface PartialDate {
    dateParts: number[]
  }

  export interface ISSNWithType {
    value: string
    type: "eissn" | "pissn" | "lissn"
  }

  export interface Response {
    status: string,
    "message-type": string,
    "message-version": string,
    message: Work
  }

}

/*
 * Functions
 */

function getRowsFromRange(range: Range): Range {
  let sheet: Sheet = range.getSheet();
  let startRowIndex: number = range.getRow();
  let endRowIndex: number = range.getLastRow();
  let lastColumnIndex: number = sheet.getLastColumn();
  let numRows: number = endRowIndex - startRowIndex + 1;

  return sheet.getRange(startRowIndex, 1, numRows, lastColumnIndex);
}

/*
 * return a doi identifier from doi string
 * @param doiString doiString
*/
function extractIdentifier(doiString: string): string {
  if (!doiString) {
    throw "doiString is invalid: " + doiString;
  }

  let reg: RegExp = /(?:https:\/\/doi\.org\/)?([0-9.]+\/.+)/;
  let result: string[] = reg.exec(doiString)

  if (result.length >= 2) {
    return result[1];
  } else {
    return "";
  }
}

function constructRequestUrl(identifier: string): string {
  let properties = PropertiesService.getScriptProperties();
  let endpoint: string = properties.getProperty("DOI_API_ENDPOINT");
  let parameters: object = {
    mailto: properties.getProperty("CROSSREF_API_MAILTO")
  }

  let url: URL = [[endpoint, identifier].join("/"), Object.keys(parameters).map((key: string) => key + "=" + parameters[key]).join("&")].join("?");
  return url;
}

function getMetadataFromDoi(doiString: string): Crossref.Response {
  let identifier: string = extractIdentifier(doiString);
  let url: string = constructRequestUrl(identifier);

  return JSON.parse(UrlFetchApp.fetch(url).getContentText());
}

function setMetadata(metadata: Crossref.Response, rowValues: any[], headers: string[]): string[] {
  let titleIndex: number = headers.indexOf('title');
  if (titleIndex >= 0) {
    rowValues[titleIndex] = metadata.message.title[0];
  }

  let authorIndex = headers.indexOf('author');
  if (authorIndex >= 0) {
    let authorValue: string = metadata.message.author.map(function (author: Crossref.Contributor): string {
      return [author.given, author.family].join(" ");
    }).join(";");

    rowValues[authorIndex] = authorValue;
  }

  let pubYearIndex: number = headers.indexOf('pubYear');
  if (pubYearIndex >= 0) {
    let publishedOnline = metadata.message['published-online'];
    let pubYearValue;

    if (publishedOnline) {
      pubYearValue = publishedOnline['date-parts'][0];
    } else {
      pubYearValue = "";
    }

    rowValues[pubYearIndex] = pubYearValue;
  }

  let journalTitleIndex = headers.indexOf('journalTitle');
  if (journalTitleIndex >= 0) {
    let journalTitleValue = metadata.message["container-title"][0];
    rowValues[journalTitleIndex] = journalTitleValue;
  }

  let issnIndex = headers.indexOf('issn');
  if (issnIndex >= 0) {
    let issnValue = metadata.message.ISSN[0];
    rowValues[issnIndex] = issnValue;
  }

  let urlIndex = headers.indexOf('url');
  if (urlIndex >= 0) {
    let urlValue = metadata.message.URL;
    rowValues[urlIndex] = urlValue;
  }

  return rowValues;
}

function updateRowByDoi(range: Range, headers: string[]): Range {
  let rows: Range = getRowsFromRange(range);
  let rowsValues: string[][] = rows.getValues();

  let updatedValues: string[][] = rowsValues.map(function (rowValues: string[]): string[] {
    let doi: string = rowValues[headers.indexOf('doi')];
    let metadata: Crossref.Response = getMetadataFromDoi(doi);

    return setMetadata(metadata, rowValues, headers);
  });

  rows.setValues(updatedValues);

  return rows;
}

function updateSelectedRowByDoi(): void {
  let sheet: Sheet = SpreadsheetApp.getActiveSheet();
  let range: Range = sheet.getActiveRange();
  let header_row: number = 1
  let headers: string[] = sheet.getRange([header_row, header_row].join(":")).getValues()[0];

  updateRowByDoi(range, headers);
}

function onOpen(): void {
  let ui = SpreadsheetApp.getUi();
  ui.createMenu('DOI Service')
    .addItem('DOIからメタデータを取得する', 'updateSelectedRowByDoi')
    .addToUi();
}