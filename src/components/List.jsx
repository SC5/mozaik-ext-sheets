import _ from 'lodash';
import sampleSize from 'lodash.samplesize';
import map from 'lodash.map';
import flow from 'lodash.flow';
import defaultsDeep from 'lodash.defaultsdeep';
import forEach from 'lodash.foreach';
import filter from 'lodash.filter';
import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import { ListenerMixin } from 'reflux';
import classNames from 'classnames';
import moment from 'moment';
import format from 'string-format';
import Mozaik from 'mozaik/browser';


const MIN_FONT_SIZE = 10;

function formatEventTimerange(event) {
  let start, end, now, diff;
  start = moment(event.start);
  end = moment(event.end);
  now = moment();
  diff = start.diff(now);
  if (diff < 0) {
    return `Ends ${end.fromNow()}`;
  } else {
    return `${start.calendar()} to ${end.format('HH:mm')}`;
  }
};

class List extends Component {

  constructor(props) {
    super(props);

    this.state = {
      rows: [],
      width: 200,
      height: 200
    };
  }

  componentWillMount() {
    var extender = {};

    // Register format functions (!method) if any defined in config
    // NOTE: Functions needs to be converted into String to get them here
    each(this.props.format || {}, (funk, key) => {
      extender[key] = eval(`(${funk})`);
    });

    format.extend(String.prototype, extender);
  }

  componentDidMount() {
    this.mounted = true;

    // Get area size
    const bodyElement = this._body.getDOMNode();
    this.setState({
      height: bodyElement.clientHeight,
      width: bodyElement.clientWidth
    });
  }

  getApiRequest() {
    const id = `sheets.list.${this.props.documentId}-${this.props.sheetNo}`;

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
    let rows = map(rawRows, (rowCells, index) => {
      let fieldsByColumn = {};
      // Group row cells by column and transform into format:
      // { A: { id: 'field-A1 col-A row-1', value: 'A', row: 1 }}
      flow(
        groupBy('column'),
        each((columnEntry, key) => {
          // Columns are unique, thus we can flatten the entry
          columnEntry = columnEntry[0];
          fieldsByColumn[key] = columnEntry.content;
        }),
        (rowCells)
      );

      return fieldsByColumn;
    });

    // Filter if defined
    if (this.props.filter) {
      const filter = eval(`(${this.props.filter})`);
      rows = filter(rows, filter);
    }

    // Pick random(s) if defined
    if (this.props.random > 0) {
      rows = sampleSize(rows, this.props.random);
    }

    this.setState({
      rows: rows,
      updated: now
    });
  }

  getFontSize(width, height, textLength = 1) {
    const textLengthFactor = 2.1;
    let size = Math.ceil(Math.sqrt((width * height / (textLength * textLengthFactor))));
    return size > MIN_FONT_SIZE ? size : MIN_FONT_SIZE;
  }

  render() {
    const title = this.props.title;
    let textLength = 0;
    const styles = defaultsDeep(this.props.styles, {
      list: {

      },
      listItem: {

      }
    });

    const items = this.state.rows.map((rowFields, rowIndex) => {
      // Render fields
      const fields = map(this.props.fields || [], (fieldTemplate, fieldIndex) => {
        // NOTE: format() does not support extends
        const formattedField = fieldTemplate.format(rowFields);
        const fieldIdentifier = format('field-{}', fieldIndex);
        textLength += formattedField.length;
        return <span className={fieldIdentifier}>{formattedField}</span>;
      });

      const rowIdentifier = `sheets__${this.props.style}-item row-${rowIndex}`;
      return <li style={styles.listItem} key={rowIdentifier} className={rowIdentifier}>{fields}</li>;
    });

    // Calculate or use specific font size
    let style = {};
    let fontSize = null;
    if (this.props.fontSize === 'auto') {
      const fontSize = this.getFontSize(this.state.width, this.state.height, textLength);
      style = {
        fontSize: fontSize,
        lineHeight: `${fontSize + 2}px`
      };
    }
    else if (this.props.fontSize) {
      style = {
        fontSize: this.props.fontSize,
        lineHeight: `${fontSize + 2}px`
      };
    }

    const listClass = `sheets__${this.props.style}`;
    const widget = (
      <div>
        <div className="widget__header">
          {title}
          <i className="fa fa-table" />
        </div>
        <div className="widget__body sheets sheets_list" style={style} ref={(c) => this._body = c}>
          <ul style={styles.list} className={listClass}>
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
  style: React.PropTypes.string,
  styles: React.PropTypes.object,
  fontSize: React.PropTypes.string,
  random: React.PropTypes.integer,
  filter: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.bool
  ]),
  fields: React.PropTypes.array,
  format: React.PropTypes.object
};

List.defaultProps = {
  title: 'Sheets',
  sheetNo: 0,
  style: 'list',
  styles: {},
  fontSize: '',
  filter: false,
  random: 0,
  fields: ['{A}', '{B}', '{C}', '{D}']
};

reactMixin(List.prototype, ListenerMixin);
reactMixin(List.prototype, Mozaik.Mixin.ApiConsumer);

export default List;
