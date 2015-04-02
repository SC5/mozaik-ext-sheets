"use strict";
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Promise = require('bluebird');
var chalk = require('chalk');
var Sheets = require('google-sheets-api').Sheets;
var config = require('./config');


module.exports = function (mozaik) {
  mozaik.loadApiConfig(config);

  var serviceEmail = config.get('sheets.googleServiceEmail');
  var serviceKeyPath = path.normalize(config.get('sheets.googleServiceKeypath'));

  // Seems absolute/relative?
  if (serviceKeyPath.substr(0, 1) !== '/') {
    serviceKeyPath = path.join(process.cwd(), serviceKeyPath);
  }
  // Check the existance of .PEM file
  if (!fs.existsSync(serviceKeyPath)) {
    mozaik.logger.error('Failed to find .PEM file: %s -- ignoring API', serviceKeyPath);
    return {
      list: function(params) {
        return Promise.reject([]);
      }
    };
  }

  // Initiate the Sheets client
  var sheets = new Sheets({
    email: serviceEmail,
    key: fs.readFileSync(serviceKeyPath).toString()
  });

  return {
    list: function(params) {
      params = params || {};
      mozaik.logger.info('Reading sheets cells from %s', params.documentId);

      return sheets
      .getSheets(params.documentId)
      .then(function(docSheets) {
        var sheet = docSheets[params.sheetNo || 0];
        return sheets.getRange(params.documentId, sheet.id, params.range);
      })
      .then(function(rows) {
        mozaik.logger.info('Found %s rows', rows.length);
        return Promise.resolve(rows);
      })
      .catch(function(err) {
        mozaik.logger.error(chalk.red('Failed to read sheets'), err);
        return Promise.reject([]);
      })
    }
  }
};