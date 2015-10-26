var StyleSheet = require('react-style');

function mergeStyles() {
  var styles = {};

  for (var i=0, l=arguments.length; i<l; i++) {
    var style = arguments[i];
    Object.keys(style).forEach((key) => {
      styles[key] = style[key];
    });
  }

  return styles;
}

const TEXT_STYLE = {
  color: '#F4FFFF',
  lineHeight: '16px',
};

module.exports = StyleSheet.create({
  container: {
    padding: 5,
  },

  view: {
    marginTop: 0,
    display: 'flex',
  },

  text: mergeStyles(TEXT_STYLE),

  item: mergeStyles(TEXT_STYLE, {
    display: 'block',
  }),

  caret: mergeStyles(TEXT_STYLE, {
    width: 14.25,
    display: 'inline-block',
  }),

  input: mergeStyles(TEXT_STYLE, {
    height: 16,
    flex: 1,
    backgroundColor: 'transparent',
    border: '0 none',
    outline: 'none',
    marginLeft: -1,
  }),
});

module.exports.format = StyleSheet.create({
  pre: {
    whiteSpace: 'pre',
  },

  error: {
    color: '#B70009',
  },

  string: {
    color: '#33A333',
  },

  number: {
    color: '#BBBB06',
  },

  undefined: {
    color: '#666663',
  },

  null: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  date: {
    color: '#A333A3',
  },

  object: {
    color: '#33A3A3',
  },
});
