const path = require('path');

const config = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    path: path.resolve(__dirname, './public/js'),
    filename: 'bundle.js',
    publicPath: '/js'
  },
  devServer: {
    open: true,
    port: 8080,
    contentBase: path.resolve(__dirname, './public')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
};

module.exports = config;