function getRowsFromRange (range) {
  var sheet = range.getSheet();
  var startRowIndex = range.getRow();
  var endRowIndex = range.getLastRow();
  var lastColumnIndex = sheet.getLastColumn();
  var numRows     = endRowIndex - startRowIndex + 1;
  
  return sheet.getRange(startRowIndex, 1, numRows, lastColumnIndex);
}

function extractIdentifier(doiString) {
  if (!doiString) {
    throw "doiString is invalid: " + doiString;
  }
  
  var reg = /(?:https:\/\/doi\.org\/)?([0-9.]+\/.+)/;
  var result = reg.exec(doiString)
  
  if (result.length >= 2) {
    return result[1];
  } else {
    return "";
  }
}

function constructRequestUrl(identifier) {
  var endpoint = PropertiesService.getScriptProperties("DOI_API_ENDPOINT");
  var url = endpoint + identifier;
  return url;
}

function getMetadataFromDoi(doiString) {
  var identifier = extractIdentifier(doiString);
  var url        = constructRequestUrl(identifier);
  
  return JSON.parse(UrlFetchApp.fetch(url).getContentText());
}

function setMetadata(metadata, rowValues, headers) {
  var titleIndex = headers.indexOf('title');
  if(titleIndex >= 0) {
    var titleValue = metadata.message.title[0];
    rowValues[titleIndex] = titleValue;
  }
  
  var authorIndex = headers.indexOf('author');
  if(authorIndex >= 0) {
    var authorValue = metadata.message.author.map(function (author) {
      return [author.given, author.family].join(" ");
    }).join(";");
    rowValues[authorIndex] = authorValue;
  }

  var pubYearIndex = headers.indexOf('pubYear');
  if(pubYearIndex >= 0) {
    var publishedOnline = metadata.message['published-online'];
    var pubYearValue;
    
    if (publishedOnline) {
      pubYearValue = publishedOnline['date-parts'][0];
    } else {
      pubYearValue = "";
    }
    
    rowValues[pubYearIndex] = pubYearValue;
  }

  var journalTitleIndex = headers.indexOf('journalTitle');
  if(journalTitleIndex >= 0) {
    var journalTitleValue = metadata.message["container-title"][0];
    rowValues[journalTitleIndex] = journalTitleValue;
  }

  var issnIndex = headers.indexOf('issn');
  if(issnIndex >= 0) {
    var issnValue = metadata.message.ISSN[0];
    rowValues[issnIndex] = issnValue;
  }
  
  var urlIndex = headers.indexOf('url');
  if(urlIndex >= 0) {
    var urlValue = metadata.message.URL;
    rowValues[urlIndex] = urlValue;
  }
  
  return rowValues;
}

function updateRowByDoi(range, headers) {
  var rows = getRowsFromRange(range);
  var notation = rows.getA1Notation();
  var rowsValues = rows.getValues();
  
  var updatedValues = rowsValues.map(function (rowValues) {
    var doi = rowValues[headers.indexOf('doi')];
    var metadata = getMetadataFromDoi(doi);
    
    return setMetadata(metadata, rowValues, headers);
  });

  rows.setValues(updatedValues);
  
  return rows;
}

function updateSelectedRowByDoi() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getActiveRange();
  var headers = sheet.getRange("2:2").getValues()[0];
  
  updateRowByDoi(range, headers);
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('DOI Service')
      .addItem('DOIからメタデータを取得する', 'updateSelectedRowByDoi')
      .addToUi();
}