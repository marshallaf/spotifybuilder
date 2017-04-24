const path = require('path');

module.exports = {
  entry: path.join(__dirname, '/app/src/app.js'),
  output: {
    path: path.join(__dirname, '/app/build'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, '/app/src'),
        loader: 'babel-loader',
        options: {
          presets: [ 'es2015', 'react' ],
        },
      },
      {
        test: /\.scss$/,
        include: path.join(__dirname, '/app/src'),
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ],
      }
    ],
  },
  watch: true,
  devtool: 'source-map',
};