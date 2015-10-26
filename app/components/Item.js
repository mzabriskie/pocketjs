var React = require('react');
var format = require('../helpers/format');
var styles = require('../helpers/styles');

module.exports = React.createClass({
  getDefaultProps: function () {
    return {
      row: {},
    };
  },

  shouldComponentUpdate: function () {
    return false;
  },

  render: function () {
    var row = this.props.row;
    return (
      <div style={styles.item}>
        {row.type === 'in' ? '> ' : ''}
        {row.type === 'out' ? format(row.value) : row.value}
      </div>
    );
  },
});
