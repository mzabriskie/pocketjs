var React = require('react');
var Item = require('./Item');
var evaluate = require('../helpers/evaluate');
var styles = require('../helpers/styles');
var History = require('../helpers/history');

module.exports = React.createClass({
  getInitialState: function () {
    this.history = new History();
    var state = {
      io: this.history.getFullHistory(),
      inputValue: null,
      historyEnabled:true,
      selectedHistoryItem:null
    };

    return state;
  },

  componentDidMount: function () {
    // Return focus to input, unless some text has been selected
    document.onmouseup = (e) => {
      if (window.getSelection().isCollapsed) {
        this.refs.textInput.focus();
      }
    };

    //listen for up/down arrows for history
    document.addEventListener("keydown",this.handleKeyDown);

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

    document.removeEventListener('keydown',this.handleKeyDown);

    this.worker.onmessage = null;
    this.worker = null;
  },

  handleKeyDown:function(e) {
      let newIdx;
      switch(e.keyCode) {
          case(38):
              newIdx = this.state.selectedHistoryItem !== null
                  ? Math.max(this.state.selectedHistoryItem - 2, 0)
                  : this.state.io.length -2;
              this.setState({inputValue:this.state.io[newIdx].value,selectedHistoryItem:newIdx});
              break;
          case(40):
              newIdx = Math.min(this.state.selectedHistoryItem+2,this.state.io.length-2);
              this.setState({inputValue:this.state.io[newIdx].value,selectedHistoryItem:newIdx});
              break;
      }
  },
  handleInputChange(e){
      this.setState({inputValue:e.target.value});
  },
  handleInputKeyUp: function (e) {
    if (e.keyCode !== 13) {
      return;
    }

    var code = e.target.value.trim();

    // Use Web Worker to handle evaluation if possible
    if (this.worker) {
      this.worker.postMessage(code);
    } else {
      this.handleWorkerMessage({
        data: {
          code: code,
          result: evaluate(code),
        }
      });
    }
  },

  handleWorkerMessage: function (e) {
    var io = this.state.io;
    var code = e.data.code;
    var result = e.data.result;

    // Add input/output to state
    let input  = { id: io.length, type: 'in', value: code };
    io.push(input);
    let output = { id: io.length, type: 'out', value: result };
    io.push(output);

    //if history enabled, store the input and output
    if (this.state.historyEnabled) {
        this.history.store(input);
        this.history.store(output);
    }


    // Re-render, and clear input
    this.setState({ io, inputValue: ' ' }, () => {
      // Return defaultValue, and set focus
      this.setState({ inputValue: null }, () => {
        setTimeout(() => {
          this.refs.textInput.focus();
        }, 100);
      });

      // Keep scrolling to the bottom
      var element = document.getElementById("container");
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
            onChange={this.handleInputChange}
            value={this.state.inputValue}
            style={styles.input}
            onKeyUp={this.handleInputKeyUp}
          />
        </div>
      </div>
    );
  },
});
