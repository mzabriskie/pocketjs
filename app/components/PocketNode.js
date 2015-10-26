var React = require('react');
var Item = require('./Item');
var evaluate = require('../helpers/evaluate');
var styles = require('../helpers/styles');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      io: [],
      inputValue: null,
    };
  },

  componentDidMount: function () {
    // Return focus to input, unless some text has been selected
    document.onmouseup = (e) => {
      if (window.getSelection().isCollapsed) {
        this.refs.textInput.focus();
      }
    };
  },

  componentWillUnmount: function () {
    document.onmouseup = null;
  },

  handleInputKeyUp: function (e) {
    if (e.keyCode !== 13) {
      return;
    }

    var io = this.state.io;
    var code = e.target.value.trim();
    var result = evaluate(code);

    // Add input/output to state
    io.push({ id: io.length, type: 'in', value: code });
    io.push({ id: io.length, type: 'out', value: result });

    // Re-render, and clear input
    this.setState({ io, inputValue: ' ' }, () => {
      // Return defaultValue, and set focus
      this.setState({ inputValue: null }, () => {
        setTimeout(() => {
          this.refs.textInput.focus();          
        }, 100);
      });
      
      // Keep scrolling to the bottom
      document.body.scrollTop = document.body.scrollHeight;
    });
  },
  
  render: function () {
    return (
      <div
        style={styles.container}>
        <div style={styles.text}>$ pocket-node</div>
        {this.state.io.map((row) => <Item row={row} key={row.id}/>)}
        <div style={styles.view}>
          <span style={styles.caret}>> </span>
          <input
            ref="textInput"
            autoFocus={true}
            autoCorrect={false}
            autoCapitalize={false}
            defaultValue=""
            value={this.state.inputValue}
            style={styles.input}
            onKeyUp={this.handleInputKeyUp}
          />
        </div>
      </div>
    );
  },
});
