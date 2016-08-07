var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = {
  entry: {
        vendor: "./public/javascripts/vendor",
        bundle: "./public/javascripts/main"},
  output: {
    path: __dirname,
    filename: "./public/javascripts/dist/[name].js"
  },

  devtool: 'source-map',

  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['vendor','bundle' ]
    })],
    
  module: {
    loaders: [
      {
        test: /\.ts/,
        loaders: ['ts-loader'],
        exclude: /node_modules/
      }
    ]
  }
};