var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
  devtool: 'source-map',

    output: {
    path: __dirname,
    filename: "./public/javascripts/dist/[name].js"
  },

  //output: {
 //   path: helpers.root('dist'),
 //   publicPath: 'http://localhost:8080/',
 //   filename: '[name].js',
 //   chunkFilename: '[id].chunk.js'
 // },


});