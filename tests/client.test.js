import path from 'path';
import Promise from 'bluebird';
import convict from 'convict';
import proxyquire from 'proxyquire';
import test from 'ava';
import SheetsStub from './sheets-stub';

proxyquire.noPreserveCache();

const configValues = {
  'sheets.googleServiceEmail': 'test@developer.google.com',
  'sheets.googleServiceKeypath': path.join(__dirname, 'test.pem')
};

const configStub = proxyquire('../src/config', {
  convict: () => {
    return {
      get: (name) => {
        return configValues[name];
      }
    }
  }
});

// Create mozaik extension client with stubs
const Client = proxyquire('../src/client', {
  './config': configStub,
  'google-sheets-api': {
    Sheets: SheetsStub
  }
}).default;

test('should return events', (t) => {
  const client = Client({
    logger: console,
    loadApiConfig: function(configStub){}
  });

  return client.list({ documentId: '123' })
    .then(function(events) {
      t.not(events.length, 0);
    });
});
