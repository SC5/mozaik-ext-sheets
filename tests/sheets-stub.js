var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var proxyquire = require('proxyquire');
var convict = require('convict');

var SheetsStub;

SheetsStub = function() {
  this.key = 'test';
  this.email = 'test@company.com';
};

SheetsStub.prototype.authorize = function() {
  console.log('mocked authorize');
  return Promise.resolve();
};

SheetsStub.prototype.getSheets = function() {
  return Promise.resolve([{ id: 0 }]);
};

SheetsStub.prototype.getCells = function(documentId, sheetId) {
  var raw = fs.readFileSync(path.join(__dirname, 'cells.json')).toString();
  return Promise.resolve(JSON.parse(raw));
};

SheetsStub.prototype.getRange = function(documentId, sheetId) {
  var raw = fs.readFileSync(path.join(__dirname, 'range.json')).toString();
  return Promise.resolve(JSON.parse(raw));
};


module.exports = SheetsStub;
