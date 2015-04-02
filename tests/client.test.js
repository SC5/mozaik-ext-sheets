var path = require('path');
var Promise = require('bluebird');
var proxyquire = require('proxyquire');
var convict = require('convict');



describe('Client', function() {
  // Create configuration stub
  var configStub = function() {
    var config = convict({});
    config.load({
      sheets: {
        googleServiceEmail: 'test@developer.google.com',
        googleServiceKeypath: path.join(__dirname, 'test.pem')
      }
    });
    return config;
  }();

  var SheetsStub = require('./sheets-stub');

  // Create mozaik extension client with stubs
  var Client = proxyquire('../lib/client', {
    './config': configStub,
    'google-sheets-api': {
      Sheets: SheetsStub
    }
  });

  var client = Client({
    logger: console,
    loadApiConfig: function(config){}
  });

  it('should return events', function(done) {
    client.list({ documentId: '123' }).then(function(events) {
      expect(events.length).not.toBe(0);
      done();
    });
  });

});
