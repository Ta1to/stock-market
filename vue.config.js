const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new Dotenv({
        path: path.resolve(__dirname, 'secrets.env'), // Path to your .env file
        systemvars: true, // Ensure system vars are also loaded
      }),
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      }),
    ],
    resolve: {
      fallback: {
        crypto: require.resolve('crypto-browserify'),
      },
    },
  },
})
