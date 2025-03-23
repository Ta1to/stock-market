const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  // ...existing code...
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, 'secrets.env'), // Path to your .env file
      systemvars: true, // Ensure system vars are also loaded
    }),
    // ...existing plugins...
  ],
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
    },
  },
  // ...existing code...
};