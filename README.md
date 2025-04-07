# Stock Market Poker Game

A multiplayer stock market game that combines poker-style betting with stock price predictions.

## Features

- Real-time multiplayer gameplay
- Stock market data integration via Twelve Data and Alpha Vantage APIs
- Poker-style betting system
- Technical indicators for stock analysis
- News sentiment analysis
- User authentication system
- Lobby system for game creation and joining

## Project Setup

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Firebase account (for authentication and database)
- API keys for Twelve Data and Alpha Vantage

### Environment Variables

Create a `secrets.env` file in the root directory with the following variables:

```
VUE_APP_FIREBASE_API_KEY=your_firebase_api_key
VUE_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VUE_APP_FIREBASE_DATABASE_URL=your_firebase_database_url
VUE_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
VUE_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VUE_APP_FIREBASE_APP_ID=your_firebase_app_id
VUE_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VUE_APP_TWELVE_DATA_API_KEY=your_twelve_data_api_key
VUE_APP_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
```

### Installation

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

## Project Structure

- `src/api/` - API clients for external services
- `src/assets/` - Static assets and CSS files
- `src/components/` - Reusable Vue components
- `src/config/` - Configuration files
- `src/router/` - Vue Router configuration
- `src/services/` - Service layer for business logic
- `src/utils/` - Utility functions
- `src/views/` - Vue components for routes

## Game Rules

1. Players join a game lobby
2. Each round consists of several phases:
   - Stock selection phase
   - Prediction phase
   - Betting phase
   - News reveal phase
   - Technical indicator reveal phase
   - Final price reveal phase
   - Winner determination
3. Players bet on their predictions, with the closest prediction winning the pot

## Technologies Used

- Vue.js
- Vuetify
- Firebase (Authentication, Realtime Database)
- Chart.js
- Twelve Data API
- Alpha Vantage API

## License

This project is licensed under the MIT License
