require('babel-core/browser-polyfill');
var babel = require('babel-core/browser');
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

    // Install Web Worker if supported
    if (window.Worker) {
      this.worker = new Worker('worker.js');
      this.worker.onmessage = this.handleWorkerMessage;
    }

    // Register Service Worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', {scope: './'});
    }
  },

  componentWillUnmount: function () {
    document.onmouseup = null;
    this.worker.onmessage = null;
    this.worker = null;
  },

  handleInputKeyUp: function (e) {
    if (e.keyCode !== 13) {
      return;
    }

    let code = e.target.value.trim();
    let transformed = null;

    // Transform code to something the browser understands
    try {
      transformed = babel.transform(code).code;
    } catch (e) {
      this.handleWorkerMessage({
        data: {
          code: code,
          error: e
        }
      });
      return;
    }
        
    // Use Web Worker to handle evaluation if possible
    if (this.worker) {
      this.worker.postMessage({
        code: code,
        transformed: transformed
      });
    } else {
      this.handleWorkerMessage({
        data: {
          code: code,
          result: evaluate(transformed),
        }
      });
    }
  },

  handleWorkerMessage: function (e) {
    let { io } = this.state;
    let {
      code,
      error,
      result
    } = e.data;
    
    if (error) {
      result = error instanceof Error ? error : new Error(error);
    }

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
      let element = document.getElementById("container");
      element.scrollTop = element.offsetHeight;
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
            autoCorrect="off"
            autoComplete="off"
            autoCapitalize="off"
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
