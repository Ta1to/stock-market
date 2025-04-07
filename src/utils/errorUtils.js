/**
 * Error handling utilities for the application
 * Provides consistent error handling and logging
 */

/**
 * Formats API errors for consistent display and logging
 * @param {Error} error - The error object
 * @param {String} context - Context where the error occurred
 * @returns {Object} Formatted error object
 */
export const formatApiError = (error, context = 'API') => {
  const errorResponse = error.response;
  
  // Determine if it's an axios error with response
  if (errorResponse) {
    return {
      status: errorResponse.status,
      statusText: errorResponse.statusText,
      message: errorResponse.data?.message || error.message,
      context,
      data: errorResponse.data
    };
  }
  
  // Handle network errors
  if (error.message === 'Network Error') {
    return {
      status: 0,
      statusText: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      context
    };
  }
  
  // Handle other errors
  return {
    status: error.code || 500,
    statusText: error.name || 'Error',
    message: error.message || 'An unexpected error occurred',
    context,
    stack: error.stack
  };
};

/**
 * Logs an error with consistent formatting
 * @param {Error} error - The error object
 * @param {String} context - Context where the error occurred
 */
export const logError = (error, context = 'App') => {
  const formattedError = error.response ? formatApiError(error, context) : error;
  console.error(`[${context}] Error:`, formattedError);
  
  // Can be extended to send errors to a monitoring service
};

/**
 * Creates a user-friendly error message
 * @param {Error} error - The error object
 * @param {String} fallbackMessage - Fallback message if none can be extracted
 * @returns {String} User-friendly error message
 */
export const getUserErrorMessage = (error, fallbackMessage = 'An unexpected error occurred. Please try again.') => {
  if (!error) return fallbackMessage;
  
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  
  if (error.message && !error.message.includes('Error:')) {
    return error.message;
  }
  
  return fallbackMessage;
};