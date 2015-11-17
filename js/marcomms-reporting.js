function runDemo() {
  try {
    // crossref related functions
    //
    //var corssref_sheet_index = 0;
    //articles = eLifeFromCrossref();
    //outputToSpreadsheet(articles, crossref_sheet_index);
    //
    // update and google analytics related fucntions
    //
    // var firstProfile = getFirstProfile();
    // var results = getReportDataForProfile(firstProfile);
    //
    // do the monthly summares
    updatePageViews();
    // runSummaries();
  } catch(error) {
    Browser.msgBox(error.message);
  }
}

/*
 * add an `Analyse` menu to the spreadsheet.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('Analyse')
  .addItem('Generate Month Bins', 'runSummaries')
  .addItem('Clear Month Bins', 'cleanupSummaries')
  .addItem('Update Pageviews', 'updatePageViews')
  .addItem('Update DOIs', 'updateFromFromCrossref')
  .addToUi();
}

/*
 * Get all DOIs from crossref, with dates and titles
 * add these to the first sheet
*  update the second sheet with the eid and published date
 */
function updateFromFromCrossref(){
  var crossref_sheet_index = 0;
  var articles = eLifeFromCrossref();
  outputToSpreadsheet(articles, crossref_sheet_index);
  updateReportingSheetWithNewEIDS();
}

/*
 * get a set of count bins from the settings sheet
 * generate montly summaries for how many articles had pagesviews that fall into one of the bins
 * output these summareis to a sheet
 * output a normalised vector for these summaries to another sheet
 */
function runSummaries(){
  var summary_sheet_index = 2;
  var norm_summary_sheet_index = 3;
  var session_bins = getSessionBinsFromSheet();
  var monthly_summaries = generateMonthVectors(session_bins);
  var normalised_month_summaries = normaliseMonthlySummaries(monthly_summaries);
  outputDictToSpreadsheet(monthly_summaries, summary_sheet_index);
  outputDictToSpreadsheet(normalised_month_summaries, norm_summary_sheet_index);
}

/*
 * deletes entires in the montly summary sheets
 *
 * sometimes we will want to bin our resutls into fewer bins.
 * when we do this the new summary data will not overwrite all of the old data so this is a convineinece function to create some empty sheets ahead of time.
 *
 */
function cleanupSummaries(){
  var summary_sheet_index = 2;
  var norm_summary_sheet_index = 3;
  clearSheet(summary_sheet_index);
  clearSheet(norm_summary_sheet_index);
}

/*
 * given a sheet id, empty the sheet
 */
function clearSheet(sheetID) {
  var ss = SpreadsheetApp.getActiveSpreadsheet() ; // overwrite existing active sheet, use .insertSheet() to add a new sheet.
  var sheet = ss.getSheets()[sheetID];
  sheet.clear();
}

/*
 * Add all of the numbers of a one dimensional array together
 *
 * @param(Array) vector
 * @return(Float) sum
 */
function sumVector(vector) {
  var sum = 0.0;
  for (var v in vector) {
    if (vector.hasOwnProperty(v)){
      sum = sum + vector[v];
    }
  }
  return sum;
}

/*
 * Return the norm of a vector
 *
 * @param(Array) vector
 * @return(Array) norm_vector
 */
function normaliseVector (vector) {
  norm_vector = [];
  var sum = sumVector(vector);
  for (var v in vector) {
    if (vector.hasOwnProperty(v)){
      var data_point = vector[v];
      var norm_data_point = data_point / sum;
      norm_vector.push(norm_data_point);
    }
  }
  return norm_vector;
}

/*
 * Return a normalised version of our monthly summaries
 *
 * @param(Array) monthly_summaries
 * @return(Array) normalised_monthly_summaries
 */
function normaliseMonthlySummaries (monthly_summaries) {
  var normalised_monthly_summaries = {};
  var keys = Object.keys(monthly_summaries);
  for (var key in keys){ // unpack the monthly_summaries dict, and iterate over it's members
    if ( keys.hasOwnProperty(key) ){
      var this_month = keys[key];
      var this_summary = monthly_summaries[this_month];
      // normalise the vector
      var norm_summary = normaliseVector(this_summary);
      normalised_monthly_summaries[this_month] = norm_summary;
    }
  }
  return normalised_monthly_summaries;
}

/*
 * via David - takes an array and returns a null array that is one item longer than the original
 *
 * e.g. [a,b,c,d] -> [0,0,0,0,0]
 *
 * @param(Array) arr
 * @return(Array) zeroedArray
 */
var makeZeroedArray = function (arr) {
  var zeroedArray = [];
  var i = 0;
  for (; i <= arr.length; i ++) {
    zeroedArray[i] = 0;
  }
  return zeroedArray;
}

/*
 * run over all month - sessions pairs
 * compare the given session to a set of bins
 * generate a map of the month to the distribution of amount of items that fall within a given value bin
 *
 * e.g. input: 2012-01: 23, 2012-01: 24, 2012-02: 1, 2012-02: 22
 * bins: [10, 20, 30]
 *
 * output is:
 * [2012-01: [0, 2, 0], 2012-02: [1,1,0]]
 *
 * @param(Array) session_bins
 * @return(Array) month_count_bins - an array of dicts
 */
function generateMonthVectors (session_bins) {
  var ss = SpreadsheetApp.getActiveSpreadsheet() ;
  var sheet = ss.getSheets()[1]; // TODO: remove hardcoded reference to sheet
  var dates = getSecondCol(sheet);
  var sessions = getThirdCol(sheet);
  var month_count_bins = {};
  // var month_count_vector = new Array(session_bins.length).fill(0);
  for (var row_index in dates) {
    if(dates.hasOwnProperty(row_index)) {
      var session = sessions[row_index];
      if (session != "no data" && session != "undefined") { // proceed only if we have data
        var date = dates[row_index];
        var month_year = date.split("-")[0] + "-" + date.split("-")[1];
        var keys = Object.keys(month_count_bins);
        // create or ensure, that a vector exists for the date year key
        if (keys.indexOf(month_year) > -1) {
          Logger.log("we have this already");   // we already have this key TODO: be more elegant that writing to the log
        } else {
          var new_null_array = makeZeroedArray(session_bins);
          month_count_bins[month_year] = new_null_array; // e.g. {2014-02: [0,0,0,0,0,0,0,0,0,0,0]}
        }
        var session_bin_index = get_session_bin_index(session, session_bins);
        var current_count = month_count_bins[month_year][session_bin_index];
        month_count_bins[month_year][session_bin_index] = current_count + 1; // increment the count for the bin item
      } else { // no usable session data for this date, so pass
        continue
      }
    }
  }
  return month_count_bins;
}

/*
 * take in a value and an array of values ,
 * return the index of the array where the value is lower than the value at that array index
 * if the value is higher than any item in the array, return an index equal to the number of items in the array
 *
 * e.g.
 * value, [array] - returns -> index
 *
 * 5, [10, 20, 30] -> 0
 * 15, [10, 20, 30] -> 1
 * 25, [10, 20, 30] -> 2
 * 35, [10, 20, 30] -> 3
 *
 * @param(Float, Array) sessions, session_bins
 * @return(Float) max_index
 */
function get_session_bin_index (sessions, session_bins) {
  for (var index in session_bins) {
    if(session_bins.hasOwnProperty(index)) {
      if (sessions < session_bins[index]) {
        return index;
      }
    }
  }
  var max_index = session_bins.length;
  return max_index;
}

/*
 * Split date string that contain time info, and return only the yyyy-MM-dd part of the date
 */
function getMonthYearFromDate (results_with_pubdates) {
  var pub_date_month_year = date.split("T")[0];
  return pub_date_month_year;
}

/* eidFromDOI(doi) returns the elife article id given the doi
 *
 * 10.7554/elife.11611 returns e11611
 * 10.7554/elife.00078 returns e00078
 * the prepended e is to prevent google sheets from stripping leading zeros
 *
 * @param(String) doi
 * @return(String) eid
 */
function eidFromDOI(doi) {
  var eid = "00000";
  var doi_parts = doi.split(".");
  var eid = "e" + doi_parts[doi_parts.length-1];
  return eid;
}

/*
 * from http://stackoverflow.com/questions/6882104/faster-way-to-find-the-first-empty-row
 *
 */
function getFirstEmptyRow(sheet) {
  var column = sheet.getRange('A:A');
  var values = column.getValues(); // get all data in one call
  var ct = 0;
  try {
    while ( values[ct][0] != "" ) {
      ct++;
    }
    return (ct);
  } catch(error) { // we have probably hit the bottom of the sheet
    return values.length;
  }
}


function mergePOAandVOR(results) {
  // get the sessions keys by end, but don't merge when we
  // have two entries with the same eid. ;

  var eidResults = {}; // this is an empty dict, ian :P
  var results_rows = results.getRows();

  var i;
  for (i = 0; i < results_rows.length; i++ ) {
    var landingPagePath = results_rows[i][0];
    var sessions = results_rows[i][1];
    if (landingPagePath != "(not set)") {
      var eid = getEIDFromPath(landingPagePath);
      var keys = Object.keys(eidResults); // do the adding in here!
      if (keys.indexOf(eid) > -1) {
        var old_sessions = eidResults[eid];
        var new_sessions = parseInt(sessions, 10) + parseInt(old_sessions, 10);
        eidResults[eid] = new_sessions.toString();
      } else {
        eidResults[eid] = sessions;
      }
    }
  }
  return eidResults;
}


/**
 * getEIDFromPath() returns Elife ID of an article given the ga:landingPagePath
 * based on the passed in tag name
 *
 * /content/early/2015/08/06/eLife.05563 will return 05563
 * /content/4/e05005 will return 05005
 * /content/4/e09560.full will return 09560
 * /content/4/e09560.short will return 09560
 * /content/4/e09560/abstract-1 will return 09560
 * /content/4/e09560/media-1 will return 09560
 *
 * @param {String} articlePath
 * @return {String} eid
 */
function getEIDFromPath(articlePath){
  var eid = "";
  var path_parts = articlePath.split("/");
  var path_tail = path_parts.pop();
  // check for /eLife.05563 case
  if (path_tail.indexOf("ife") > -1) {
    eid = path_tail.split(".").pop();
  } else if (path_tail.indexOf("full") > -1){
    // check for the e09560.full case
    eid = path_tail.split(".")[0];
    eid = eid.substring(1); // remove the leading `e` from the the eid
  }  else if (path_tail.indexOf("short") > -1){
    // check for the e09560.short case
    eid = path_tail.split(".")[0];
    eid = eid.substring(1); // remove the leading `e` from the the eid
  } else if (path_tail.indexOf("abstract") > -1) {
    // check for the abstract-1 case
    eid = path_parts[path_parts.length - 1]; // get the last item in the array (the tail has already been popped)
    eid = eid.substring(1); // remove the leading `e` from the the eid
  } else if (path_tail.indexOf("media") > -1) {
    // check for the abstract-1 case
    eid = path_parts[path_parts.length - 1]; // get the last item in the array (the tail has already been popped)
    eid = eid.substring(1); // remove the leading `e` from the the eid
  } else if (path_tail.indexOf("article-data") > -1) {
    // check for the article-data case
    eid = path_parts[path_parts.length - 1]; // get the last item in the array (the tail has already been popped)
    eid = eid.substring(1); // remove the leading `e` from the the eid
  } else if (path_tail.indexOf("article-metrics") > -1) {
    // check for the article-metrics case
    eid = path_parts[path_parts.length - 1]; // get the last item in the array (the tail has already been popped)
    eid = eid.substring(1); // remove the leading `e` from the the eid
  } else if (path_tail.indexOf("article-info") > -1) {
    // check for the article-info case
    eid = path_parts[path_parts.length - 1]; // get the last item in the array (the tail has already been popped)
    eid = eid.substring(1); // remove the leading `e` from the the eid
  } else if (path_tail.indexOf("F") > -1) {
    // check for the F14 etc.
    eid = path_parts[path_parts.length - 1]; // get the last item in the array (the tail has already been popped)
    eid = eid.substring(1); // remove the leading `e` from the the eid
  } else {
    eid = path_tail.substring(1); // remove the leading `e` from the the eid
  }
  return eid;
}

function getFiftyDaySessionDataForEid() {
  // var profile = getFirstProfile();
  var eid = "e05378";
  var date = "1/29/2015";
  // Logger.log(eid);
  var session_report = getReportDataForProfile(eid, date);
  var eid_result = mergePOAandVOR(session_report);
  var sessions_count = eid_result[eid.substring(1)];
  Logger.log(sessions_count);
}


function updatePageViews() {
  // var profile = getFirstProfile();
  var ss = SpreadsheetApp.getActiveSpreadsheet() ; // overwrite existing active sheet, use .insertSheet() to add a new sheet.
  var sheet = ss.getSheets()[1];
  var eids = getFirstCol(sheet);
  var dates = getSecondCol(sheet);
  var sessions = getThirdCol(sheet);

  var eid = eids[0];
  var date = dates[0];
  var session = sessions[0];

  var iter_number = 0;
  var iter_max = getBatchQueryIteration(); // 25;

  for (var i = 0; i < eids.length; i++) {
    if (iter_number < iter_max){
      eid = eids[i];
      var current_session_data = sessions[i];
      if (current_session_data === "" ){
        var date = sheet.getRange(i+1,2).getValue();
        var session_report = getReportDataForProfile(eid, date);
        if (session_report.length === 0 ){
          // if we have no data returned from getReportDataForProfile
          //Logger.log("no data"); // probably no data in early date results.
          sessions[i] = "no data";
        } else {
          var eid_result = mergePOAandVOR(session_report);
          var sessions_count = eid_result[eid.substring(1)];
          sessions[i] = sessions_count;
          iter_number = iter_number +1 ;
          Logger.log(iter_number);
        }
      } else {
        continue;
      }
    } else {
      break;
    }
  }
  setThirdCol(sheet, sessions);
}

function generateDate(start_date){
  var date_parts = start_date.split("-");
  var year = start_date.split("-")[0];
  var month = start_date.split("-")[1] -1;
  var day = start_date.split("-")[2];
  return new Date(year, month, day);
}

function getDateWindow(start_date, nDaysAgo) {
  var after = generateDate(start_date);
  var before = generateDate(start_date);
  var check_date = before.getDate();
  before.setDate(before.getDate() + nDaysAgo);
  // return before;
  return Utilities.formatDate(before, 'GMT', 'yyyy-MM-dd');
}


function getReportDataForProfile(eid, pub_date) {
  var analyticsNumber = getTableIdFromSettings();
  var maxResults = getMaxResultsFromSettings();
  var publishedDaysRange = getPublishedDaysFromSettings(); //

  var tableId = 'ga:' + analyticsNumber // 82618489; // this is the view id for elife-subdomain-account / journal site / All Web Site Data - which is the correct view id
  var startDate = getDateWindow(pub_date, 0);
  var endDate = getDateWindow(pub_date, publishedDaysRange);   // 50

  var vor_eid = eid.substring(1); // converts e00012 to 00012
  var page_path_filter = "ga:pagePath=~" + vor_eid

  var optArgs = {
    'dimensions': 'ga:pagePath', // Comma separated list of dimensions, only interested in sessions for now, to add ga:source
    'sort': '-ga:pageviews',       // Sort by sessions descending, then keyword.
    'metrics': 'ga:pageviews',
    'start-index': '1',
    'filters': page_path_filter,
    'max-results': maxResults  // '100'
  };

  // Make a request to the API.
  var results = Analytics.Data.Ga.get(
      tableId,                    // Table id (format ga:xxxxxx).
      startDate,                  // Start-date (format yyyy-MM-dd).
      endDate,                    // End-date (format yyyy-MM-dd).
      'ga:pageviews', // Comma seperated list of metrics.
      optArgs);

  if (results.getRows()) {
    return results;


  } else {
    return [];
    // throw new Error('No views (profiles) found');
  }
}



/*
 * derived from http://stackoverflow.com/questions/6882104/faster-way-to-find-the-first-empty-row
 *
 */
function getFirstCol(sheet) {
  var column = sheet.getRange('A:A');
  var values = column.getValues(); // get all data in one call
  var stripped_values = []; // values returns an array for each cell, but we know each cell will have only one item, so we flatten these
  for (var v in values) {
    if (values.hasOwnProperty(v)) {
      stripped_values.push(values[v][0])
    }
  }
  return (stripped_values);
}


/*
 * derived from http://stackoverflow.com/questions/6882104/faster-way-to-find-the-first-empty-row
 *
 */
function getSecondCol(sheet) {
  var column = sheet.getRange('B:B');
  var values = column.getValues(); // get all data in one call
  var stripped_values = []; // values returns an array for each cell, but we know each cell will have only one item, so we flatten these
  for (var v in values) {
    if (values.hasOwnProperty(v)) {
      stripped_values.push(values[v][0])
    }
  }
  return (stripped_values);
}

/*
 * derived from http://stackoverflow.com/questions/6882104/faster-way-to-find-the-first-empty-row
 *
 */
function getThirdCol(sheet) {
  var column = sheet.getRange('C:C');
  var values = column.getValues(); // get all data in one call
  var stripped_values = []; // values returns an array for each cell, but we know each cell will have only one item, so we flatten these
  for (var v in values) {
    if (values.hasOwnProperty(v)) {
      stripped_values.push(values[v][0])
    }
  }
  return (stripped_values);
}

/*
 * derived from http://stackoverflow.com/questions/6882104/faster-way-to-find-the-first-empty-row
 *
 * set values needs a two dimensional array as an argument!
 */
function setThirdCol(sheet, values) {
  var insert_array = [];
  for (i in values) {
    if (values.hasOwnProperty(i)) {
      var insert_row = [];
      insert_row.push(values[i])
      insert_array.push(insert_row);
    }
  }
  sheet.getRange('C:C').setValues(insert_array);
  // column.setValues(values); // get all data in one call
}



/*
 * pulls only new EIDs from the sheet populated from crossref to the second sheet.
 *
 */
function updateReportingSheetWithNewEIDS() {
  var eids_pub_dates = getEidsFromDois();
  var eids = [];
  var eid_date_map = {};
  for (var i in eids_pub_dates){
    if (eids_pub_dates.hasOwnProperty(i)) {
      var eid_pub_date = eids_pub_dates[i];
      var eid = eid_pub_date[0];
      var pub_date = eid_pub_date[1];
      eids.push(eid);
      eid_date_map[eid] = pub_date;
    }
  }
 // we should always have the same, or more eids from crossref than we have in the reporting sheet, always.
  var ss = SpreadsheetApp.getActiveSpreadsheet() ; // overwrite existing active sheet, use .insertSheet() to add a new sheet.
  var sheet = ss.getSheets()[1]; // this sheet will have eids, dates and google sessions
  var first_col = getFirstCol(sheet);
  // now find out which eids are not in the reporting column yet.
  var new_eids = [];
  for (i in eids) {
    if (eids.hasOwnProperty(i)) {
      eid = eids[i];
      if (first_col.indexOf(eid) === -1) {
        new_eids.push(eid);
      }
    }
  }
  // get a sub arrray with just the new values
  var new_rows = [];
  for (var new_i in new_eids) {
    if (new_eids.hasOwnProperty(new_i)) {
      new_row = [];
      var new_eid = new_eids[new_i];
      var new_date = eid_date_map[new_eid];
      new_row.push(new_eid);
      new_row.push(new_date);
      new_rows.push(new_row);
    }
  }
  // find the index of the first row that is empty
  var empty_row_index = getFirstEmptyRow(sheet);
  // now push the new eids into the new sheet at the bottom of the sheet, if we have new values
  if (new_rows.length > 0 ) { sheet.getRange(empty_row_index + 1 , 1, new_rows.length, 2).setValues(new_rows);}
}


/* getEidsFromDois(doi) iterate over all DOIs extracted from crossref API, output a list of eids with publaction dates
 *
 * the reference to the source data sheet is hardcoded :(
 */
function getEidsFromDois() {
  var ss = SpreadsheetApp.getActiveSpreadsheet() ; // overwrite existing active sheet, use .insertSheet() to add a new sheet.
  var sheet = ss.getSheets()[0];
  var values = sheet.getDataRange().getValues();
  var eids_pub_dates = [];
  for(n=0;n<values.length;++n){
    var article_details = [];
    var doi = values[n][0];
    var pub_date = values[n][1];
    var eid = eidFromDOI(doi);
    article_details.push(eid);
    article_details.push(pub_date);
    eids_pub_dates.push(article_details);
  }
  return eids_pub_dates;
}


function getMonthYearFromDate (published) {
  var pub_date_month_year = published.split("T")[0];
  return pub_date_month_year;
}

function extractArticlesFromJSON(items, articles) {
  for (i in items){
    if(items.hasOwnProperty(i)) {
      try{
        var article = [];
        var item = items[i]; //["date-time"];
        var doi = item["DOI"];
        var title = item["title"];
        var published = item["issued"]["date-parts"][0].join("-");
        // var pub_date = getMonthYearFromDate(published);
        article.push(doi);
        article.push(published);
        article.push(title);
        articles.push(article);
      } catch (error) {
        Logger.log(items[i])
      }
    }
  }
  return articles;
}

function eLifeFromCrossref() {
  var url = 'http://api.crossref.org/journals/2050-084X/works?filter=type:journal-article&rows=800&cursor=*'
  // var url = 'http://api.crossref.org/journals/2050-084X/works?rows=10';
  var response = UrlFetchApp.fetch(url);
  var json = response.getContentText();
  var data = JSON.parse(json);
  var items = data.message.items;
  var next_cursor = data.message["next-cursor"];
  var items_per_page = data.message["items-per-page"];
  var articles = [];
  articles = extractArticlesFromJSON(items, articles);
  while (items.length > 0) {
    var url = 'http://api.crossref.org/journals/2050-084X/works?filter=type:journal-article&rows=800&cursor=' + next_cursor
    var response = UrlFetchApp.fetch(url);
    var json = response.getContentText();
    var data = JSON.parse(json);
    var items = data.message.items;
    var next_cursor = data.message["next-cursor"];
    var items_per_page = data.message["items-per-page"];
    articles = extractArticlesFromJSON(items, articles);
  }
  return articles;
}

//
// read in variable from variable sheet
//


/*
 * putting the sheet id of where variables are in a function
 * as we can't set globals in an app script - from what I understand.
 */
function returnVariableSheetNumber(){
  return 4;
}

function getNamedRow(name){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var variable_sheet_index = returnVariableSheetNumber();
  var sheet = ss.getSheets()[variable_sheet_index];
  var rows = sheet.getDataRange().getValues();
  for (var row_index in rows){
    if (rows.hasOwnProperty(row_index)) {
      var this_row = rows[row_index];
      if (this_row[0] === name) {
        result_row = this_row;
        return result_row;
      }
    }
  }
}

function getSessionBinsFromSheet(){
  var session_bins = getNamedRow("bins");
  session_bins.shift();
  var clean_session_bins = []; // just remove cells with values less than 2 as a way of filtering whitespace, e.g. [100, 200, 300, " "] -> [100, 200, 300]
  for (var row_index in session_bins){
    if (session_bins.hasOwnProperty(row_index)) {
      var value = session_bins[row_index];
      if (value > 1) {
        clean_session_bins.push(value);
      }
    }
  }
  return clean_session_bins;
}

function getTableIdFromSettings(){
  var table_id_row = getNamedRow("analytics table id");
  var tableId = table_id_row[1];
  return tableId;
}

function getMaxResultsFromSettings(){
  var maxResults_row = getNamedRow("max google results");
  var maxResults = maxResults_row[1];
  return maxResults;
}

function getPublishedDaysFromSettings(){
  var publishedDays_row = getNamedRow("days after publication");
  var publishedDays = publishedDays_row[1];
  return publishedDays;
}


function getBatchQueryIteration(){
  var query_iteration_size_row = getNamedRow("analytics batch query size");
  var query_iteration_size = query_iteration_size_row[1];
  return query_iteration_size;
}


//
// sheet output funcitons
//

/*
 *
 * takes a dict whose argument is an array, and transforms it into an array of arrays for passing to the setValues function
 *
 * e.g. {a:[1,2,3], b:[4,5,6]} -> [[a,1,2,3], [b,3,4,5]]
 *
 */
function outputDictToSpreadsheet(results, sheet_index) {
  var ss = SpreadsheetApp.getActiveSpreadsheet() ;
  var sheet = ss.getSheets()[sheet_index];
  var a_results = [];
  var keys =  Object.keys(results);
  for (var key in keys) {
    if(keys.hasOwnProperty(key)) {
      var a_result = [];
      a_result.push("month: "+keys[key]); // inserted the month prefix here to make google spreadsheets treat this as a string and not a date or a number!
      var result_vector = results[keys[key]];
      for (var r_key in result_vector) {
        if (result_vector.hasOwnProperty) {
          a_result.push(result_vector[r_key]);
        }
      }
    }
    a_results.push(a_result);
  }
  sheet.getRange(2, 2, keys.length, result_vector.length + 1).setValues(a_results);
}

/*
 * outputs an array of arrays to a spreadsheet
 *
 */
function outputToSpreadsheet(results, sheet_index) {
  var ss = SpreadsheetApp.getActiveSpreadsheet() ; // overwrite existing active sheet, use .insertSheet() to add a new sheet.
  var sheet = ss.getSheets()[sheet_index];
  sheet.getRange(1, 1, results.length, 3).setValues(results);
}
