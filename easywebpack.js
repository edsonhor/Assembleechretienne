module.exports = {
  entry: {
        bundle: "./public/javascripts/main",
        vendor: "./public/javascripts/vendor"},
  output: {
    path: __dirname,
    filename: "./public/javascripts/dist/[name].js"
  },
  resolve: {
    extensions: ['', '.js', '.ts']
  },
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