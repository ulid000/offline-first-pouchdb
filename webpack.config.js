const path = require('path'),
    htmlPlugin = require('html-webpack-plugin'),
    cleanPlugin = require('clean-webpack-plugin'),
    dist = 'dist';

module.exports = {
  entry: {
    index: './src/app.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, dist)
  },
  plugins: [
    new cleanPlugin([dist]),
    new htmlPlugin({
      filename: 'index.html',
      title: 'Offline Demo PouchDB'
    })
  ]
};
