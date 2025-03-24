const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new Dotenv({
        path: './secrets.env',
        systemvars: true,
      }),
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      }),
    ],
  },
})
