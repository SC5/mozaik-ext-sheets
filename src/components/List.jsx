var _ = require('lodash');
var format = require('string-format');
var moment = require('moment');
var React = require('react');
var Reflux = require('reflux');
var ApiConsumerMixin = require('mozaik/browser').Mixin.ApiConsumer;


format.extend(String.prototype);

var formatEventTimerange = function(event) {
  var start, end, now, diff;
  start = moment(event.start);
  end = moment(event.end);
  now = moment();
  diff = start.diff(now);
  if (diff < 0) {
    return "Ends " + end.fromNow();
  } else {
    return start.calendar() + " to " + end.format("HH:mm");
  }
};

var List = React.createClass({
  mixins: [
    Reflux.ListenerMixin,
    ApiConsumerMixin
  ],

  getInitialState() {
    return {
      rows: []
    };
  },

  propTypes: {

  },

  componentWillMount() {
    // Register format functions (!method) if any defined in config
    // NOTE: Functions needs to be converted into String to get them here
    _.each(this.props.format || [], function(funk, key) {
      var extender = {};
      extender[key] = eval('(' + funk + ')');
      format.extend(String.prototype, extender);
    });
  },

  getApiRequest() {
    var id = format('sheets.list');

    return {
      id: id,
      params: {
        documentId: this.props.documentId,
        range: this.props.range
      }
    };
  },

  onApiData(rawRows) {
    var self = this;

    if (!rawRows || rawRows.length === 0) {
      console.warn('No data');
      return;
    }

    var now = moment();
    var rows = _.map(rawRows, function(rowCells, index) {
      var fieldsByColumn = {};
      // Group row cells by column and transform into format:
      // { A: { id: 'field-A1 col-A row-1', value: 'A', row: 1 }}
      _
      .chain(rowCells)
      .groupBy('column')
      .each(function(columnEntry, key) {
        // Columns are unique, thus we can flatten the entry
        columnEntry = columnEntry[0];
        fieldsByColumn[key] = columnEntry.content;
      })
      .value();

      return fieldsByColumn;
    });

    // Filter if defined
    if (this.props.filter || true) {
      var filter = eval('(' + this.props.filter + ')');
      rows = _.filter(rows, filter);
    }

    this.setState({
      rows: rows,
      updated: now
    });
  },

  render() {
    var self = this;
    var title = self.props.title || 'Events';

    var items = self.state.rows.map((rowFields, rowIndex) => {
      // Render fields
      var fields = _.map(self.props.fields || [], function(fieldTemplate, fieldIndex) {
        var formattedField = fieldTemplate.format(rowFields);
        var fieldIdentifier = format('field-{}', fieldIndex);
        return <span className={fieldIdentifier}>{formattedField}</span>;
      });

      var rowIdentifier = format('row-{}', rowIndex);
      return <li className={rowIdentifier}>{fields}</li>;
    });

    var widget = (
      <div>
        <div className="widget__header">
          {title}
          <i className="fa fa-table" />
        </div>
        <div className="widget__body sheets sheets__list">
          <ul>
            {items}
          </ul>
        </div>
      </div>
    );

    return widget;
  }
});

module.exports = List;
