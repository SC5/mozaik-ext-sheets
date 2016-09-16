"use strict";
import path from 'path';
import fs from 'fs';
import config  from './config';
import Promise from 'bluebird';
import chalk from 'chalk';
import SheetsAPI from 'google-sheets-api';

const Sheets = SheetsAPI.Sheets;

const client = (mozaik) => {
  mozaik.loadApiConfig(config);

  var serviceEmail = config.get('sheets.googleServiceEmail');
  var serviceKeyPath = path.normalize(config.get('sheets.googleServiceKeypath'));

  // Seems absolute/relative?
  if (serviceKeyPath.substr(0, 1) !== '/') {
    serviceKeyPath = path.join(process.cwd(), serviceKeyPath);
  }
  // Check the existance of .PEM file
  if (!fs.existsSync(serviceKeyPath)) {
    mozaik.logger.error(`Failed to find .PEM file: ${serviceKeyPath} -- ignoring API`);
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

  const apiCalls = {
    list(params) {
      params = params || {};
      mozaik.logger.info(`Reading sheets cells from ${params.documentId}`);

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
  };

  return apiCalls;
};

export default client;
