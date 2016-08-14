var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var helpers = require('./helpers');

module.exports = {
  entry: {
    'polyfills': './public/javascripts/polyfills.ts',
    'vendor': './public/javascripts/vendor.ts',
    'bundle': './public/javascripts/main.ts'
  },

  resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loaders: ['ts', 'angular2-template-loader']
      }    
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['bundle', 'vendor', 'polyfills']
    }),

  ]
};