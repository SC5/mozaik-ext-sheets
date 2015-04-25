# mozaik-ext-sheets

List rows from Google Sheets in Mozaïk dashboard. The extension can be handy for various
use cases where data is maintained in Google Sheets:

- List events (including dates etc)
- Show game results
- Show event participants, company vacation listing
- Etc.

![preview](https://raw.githubusercontent.com/SC5/mozaik-ext-sheets/master/preview.png)

- The widget tries to provide a generic but easy-to-use way to show content in dashboard.
- You can also utilise the Sheets functions as the outcome is shown in widget
- Use format functions to format some cell data
- Use filter function to leave out some results

## Setup

- Install module

    ```bash
    npm install --save mozaik-ext-sheets
    ```

- Create a project and service account in Google Developer Console
- Enable API: Drive API
- Collect service email and .p12 file
- Convert .p12 file into .PEM
- Configure service key and .PEM file into dashboard ``config.js`` file and
  environment variables / ``.env`` file:

    ```javascript
    api: {
      sheets: {
        googleServiceEmail: process.env.GOOGLE_SERVICE_EMAIL,
        googleServiceKeypath: process.env.GOOGLE_SERVICE_KEYPATH
      }
    }
    ```

- Done.


## Widget: List

Show cell contents in a listing. Use dashboard theme to customize the outcome to match with your requirements.

### parameters

key           | required | description
--------------|----------|---------------
`documentId`  | yes      | *Sheets document id, taken form web UI*
`sheetNo`     | no       | *Sheet order number, starting from 0. Defaults to first: `0`*
`range`       | no       | *Range from where to list data. Example: `A2:C10` or `A2:`. Defaults to full sheet*
`fields`      | no       | *Columns to list, using advanced formatting*
`format`      | no       | *Custom formating functions in object, where key is name of the formatter and used like {COLUMNLETTER!formatter}. See usage for examples*
`filter`      | no       | *Filter some rows out of the outcome by implementing the function. See usage for examples*


### usage

Imaginary example of Google Sheet document cells:

```
    |      A     |       B       |       C       |  D  |
 1  | 2015-01-28 | React.js Conf | Facebook HQ   |     |
 2  | 2015-07-02 | ReactEurope   | Paris, France |     |
```

One widget in dashboard config:

```javascript
// widget in config.js
{
  type: 'sheets.list',
  // You can find the documentId in sheet URL
  documentId: 'abasdfsdfafsd123123',
  range: 'A1:D10',
  // Values (cells) to show on each row. Use one or multiple column letters:
  // Uses https://www.npmjs.com/package/string-format for formatting
  fields: [
    'Event date: {A!date}',
    '{B!uppercase}',
    '{C} {D}'
  ],
  // Custom formatter functions, name must match with the usage: !method
  // NOTE: Call method.toString() to every function!
  // NOTE: `moment` is available
  format: {
    // !date formatter
    date: function(s){
      return new moment(s).format('YYYY-MM-DD');
    }.toString(),
    // !uppercase formatter
    uppercase: function(s) {
      return s.toUpperCase();
    }.toString()
  },
  // Custom function to filter some results rows
  // If defined, each row is processed through it.
  // Return `false` if you want to filter the row out and `true`
  // for inclusion.
  // NOTE: Only one variable is passed, containing all columns from current row
  // NOTE: Variable `columns` does not contain the columns out of the range
  // NOTE: Call method.toString() to every function!
  filter: function(columns){
    var eventStart = moment(columns.B, ['YYYY-MM-DD']);
    // Filter out the results that are in past
    if (eventStart.isBefore(new moment())) {
      return false;
    }
    return true;
  }.toString(),
  columns: 1, rows: 2,
  x: 0, y: 0
}
```

## License

Module is MIT -licensed

## Credit

Module is backed by:

<a href="http://sc5.io">
  <img src="http://logo.sc5.io/78x33.png" style="padding: 4px 0;">
</a>
