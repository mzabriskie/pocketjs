var React = require('react');
var formatIndent = require('./formatIndent');
var styles = require('./styles').format;
var indentDepth = -1;
var GLOBAL = this;

module.exports = format;

// Format the output of a value
function format(value) {
  var result;
  indentDepth++;

  switch(typeof value) {
    case 'string':
      result = <span style={styles.string}>'{value}'</span>;
      break;

    case 'boolean':
      result = <span style={styles.number}>{value ? 'true' : 'false'}</span>;
      break;

    case 'number':
      result = <span style={styles.number}>{value}</span>;
      break;

    case 'undefined':
      result = <span style={styles.undefined}>undefined</span>;
      break;

    case 'function':
      result = (
        <span style={styles.object}>
          [Function{(value.name ? ': ' + value.name : '')}]
        </span>
      );
      break;

    case 'object':
      if (value instanceof Error) {
        result = (
          <span style={styles.error}>
            {value.constructor.name + ': ' + value.message}
          </span>
        );
      }
      else if (value instanceof Date) {
        result = <span style={styles.date}>{value.toString()}</span>;
      }
      else if (value === null) {
        result = <span style={styles.null}>null</span>;
      }
      else if (Array.isArray(value)) {
        result = recurse(value);
      }
      else {
        if ((indentDepth > 0 && GLOBAL === value) || indentDepth > 1) {
          var label = GLOBAL === value ? 'Circular' : 'Object';
          result = <span style={styles.object}>[{label}]</span>;
        }
        else {
          try {
            result = recurse(value);
          } catch (e) {
            // Errors happen when trying to render React components
            // Probably better to detect that it's a component but ¯\_(ツ)_/¯
            result = <span style={styles.object}>[Object]</span>;
          }
        }
      }
      break;

    default:
      result = <span>{value}</span>;
  }

  indentDepth--;
  return result;
}

// Recursively format an Array, or Object
function recurse(value) {
  var isArray = Array.isArray(value);
  var collection = isArray ? value : Object.keys(value);

  return (
    <span>
      {isArray ? '[ ' : '{ '}
        {
          collection.map((t, i) => {
            return (
              <span key={i} style={styles.pre}>
                {collection.length > 5 && i > 0 ? formatIndent(indentDepth) : ''}
                {!isArray && (<span>{t}: </span>)}
                {format(isArray ? t : value[t])}
                {i < collection.length - 1 && (
                  <span>,{collection.length > 5 ? <br/> : ' '}</span>
                )}
              </span>
            );
          })
        }
      {isArray ? ' ]' : ' }'}
    </span>
  );
}
