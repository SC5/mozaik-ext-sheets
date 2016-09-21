import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import { ListenerMixin } from 'reflux';
import moment from 'moment';
import format from 'string-format';
import Mozaik from 'mozaik/browser';


function formatEventTimerange(event) {
  let start, end, now, diff;
  start = moment(event.start);
  end = moment(event.end);
  now = moment();
  diff = start.diff(now);
  if (diff < 0) {
    return "Ends " + end.fromNow();
  } else {
    return `${start.calendar()} to ${end.format('HH:mm')}`;
  }
};

class List extends Component {

  constructor(props) {
    super(props);

    this.state = {
      rows: [],
    };
  }

  componentWillMount() {
    // Register format functions (!method) if any defined in config
    // NOTE: Functions needs to be converted into String to get them here
    _.each(this.props.format || [], function(funk, key) {
      var extender = {};
      extender[key] = eval('(' + funk + ')');
      format.extend(String.prototype, extender);
    });
  }

  getApiRequest() {
    const id = `sheets.list.${this.props.documentId}`;

    return {
      id: id,
      params: {
        documentId: this.props.documentId,
        sheetNo: this.props.sheetNo,
        range: this.props.range
      }
    };
  }

  onApiData(rawRows) {
    if (!rawRows || rawRows.length === 0) {
      console.warn('No data');
      return;
    }

    const now = moment();
    let rows = _.map(rawRows, function(rowCells, index) {
      let fieldsByColumn = {};
      // Group row cells by column and transform into format:
      // { A: { id: 'field-A1 col-A row-1', value: 'A', row: 1 }}
      _.chain(rowCells)
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
      const filter = eval('(' + this.props.filter + ')');
      rows = _.filter(rows, filter);
    }

    this.setState({
      rows: rows,
      updated: now
    });
  }

  render() {
    const title = this.props.title;

    const items = this.state.rows.map((rowFields, rowIndex) => {
      // Render fields
      const fields = _.map(this.props.fields || [], (fieldTemplate, fieldIndex) => {
        const formattedField = format(fieldTemplate, rowFields);
        const fieldIdentifier = format('field-{}', fieldIndex);
        return <span className={fieldIdentifier}>{formattedField}</span>;
      });

      const rowIdentifier = format('row-{}', rowIndex);
      return <li className={rowIdentifier}>{fields}</li>;
    });

    const widget = (
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

}

List.displayName = 'List';

List.propTypes = {
  documentId: React.PropTypes.string.isRequired,
  title: React.PropTypes.string,
  sheetNo: React.PropTypes.integer,
  range: React.PropTypes.string,
  fields: React.PropTypes.array,
  format: React.PropTypes.object
};

List.defaultProps = {
  title: 'Sheets',
  sheetNo: 0,
  fields: ['{A}', '{B}', '{C}', '{D}']
};

reactMixin(List.prototype, ListenerMixin);
reactMixin(List.prototype, Mozaik.Mixin.ApiConsumer);

export default List;
