/*eslint-env node*/

const path = require('path');

module.exports = {
  // configures optimizations for build mode
  mode: 'development',
  // entry point to the client-side application
  entry: path.join(__dirname, '/app/src/app.js'),
  // output options
  output: {
    path: path.join(__dirname, '/app/build'),
    filename: 'bundle.js',
  },
  module: {
    // rules for loaders, parsers, etc.
    rules: [
      {
        test: /\.js$/,
        include: [
          path.join(__dirname, '/app/src')
        ],
        loader: 'babel-loader',
        options: {
          presets: [ 
            '@babel/preset-env', // compiles to latest yearly release of JS
            '@babel/preset-react' // compiles React plugins
          ],
        },
      },
      {
        test: /\.scss$/,
        include: [
          path.join(__dirname, '/app/src')
        ],
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader' // compiles Sass to CSS
        ],
      }
    ],
  },
  // when run, webpack will stay active and rebuild the files whenever it sees that one has changed
  watch: true,
  // add source info for browser devtools - negatively impacts build speed
  devtool: 'source-map',
};