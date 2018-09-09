const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  // when run, webpack will stay active and rebuild the files whenever it sees that one has changed
  watch: true,
  // add source info for browser devtools - negatively impacts build speed
  devtool: 'inline-source-map'
});
