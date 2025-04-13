import { formatApiError, logError, getUserErrorMessage } from '@/utils/errorUtils';

describe('errorUtils', () => {
  beforeEach(() => {
    // Mock console.error to prevent test output clutter
    console.error = jest.fn();
  });

  describe('formatApiError', () => {
    it('should format Axios error responses correctly', () => {
      const axiosError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: {
            message: 'Resource not found'
          }
        },
        message: 'Request failed with status code 404'
      };

      const result = formatApiError(axiosError, 'StockAPI');
      
      expect(result).toEqual({
        status: 404,
        statusText: 'Not Found',
        message: 'Resource not found',
        context: 'StockAPI',
        data: {
          message: 'Resource not found'
        }
      });
    });

    it('should handle Axios errors without response message', () => {
      const axiosError = {
        response: {
          status: 500,
          statusText: 'Server Error',
          data: {}
        },
        message: 'Request failed with status code 500'
      };

      const result = formatApiError(axiosError);
      
      expect(result).toEqual({
        status: 500,
        statusText: 'Server Error',
        message: 'Request failed with status code 500',
        context: 'API',
        data: {}
      });
    });

    it('should handle network errors', () => {
      const networkError = {
        message: 'Network Error'
      };

      const result = formatApiError(networkError, 'DataFetch');
      
      expect(result).toEqual({
        status: 0,
        statusText: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        context: 'DataFetch'
      });
    });

    it('should handle generic errors', () => {
      const genericError = {
        code: 403,
        name: 'Forbidden',
        message: 'Access denied',
        stack: 'Error stack trace'
      };

      const result = formatApiError(genericError);
      
      expect(result).toEqual({
        status: 403,
        statusText: 'Forbidden',
        message: 'Access denied',
        context: 'API',
        stack: 'Error stack trace'
      });
    });

    it('should handle errors with minimal information', () => {
      const minimalError = {};

      const result = formatApiError(minimalError, 'Authentication');
      
      expect(result).toEqual({
        status: 500,
        statusText: 'Error',
        message: 'An unexpected error occurred',
        context: 'Authentication'
      });
    });
  });

  describe('logError', () => {
    it('should log Axios errors after formatting them', () => {
      const axiosError = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: {
            message: 'Authentication required'
          }
        }
      };

      logError(axiosError, 'Auth');
      
      expect(console.error).toHaveBeenCalledWith(
        '[Auth] Error:',
        expect.objectContaining({
          status: 401,
          statusText: 'Unauthorized',
          message: 'Authentication required'
        })
      );
    });

    it('should log non-Axios errors directly', () => {
      const simpleError = new Error('Simple error message');

      logError(simpleError, 'Component');
      
      expect(console.error).toHaveBeenCalledWith('[Component] Error:', simpleError);
    });
  });

  describe('getUserErrorMessage', () => {
    it('should extract message from Axios error responses', () => {
      const axiosError = {
        response: {
          data: {
            message: 'User-friendly error message from API'
          }
        }
      };

      const message = getUserErrorMessage(axiosError);
      
      expect(message).toBe('User-friendly error message from API');
    });

    it('should use error message when available', () => {
      const error = {
        message: 'Simple error message'
      };

      const message = getUserErrorMessage(error);
      
      expect(message).toBe('Simple error message');
    });

    it('should not use technical error messages', () => {
      const error = {
        message: 'Error: Some technical details'
      };

      const message = getUserErrorMessage(error);
      
      expect(message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should use fallback message when no message is available', () => {
      const error = {};
      const fallback = 'Custom fallback message';

      const message = getUserErrorMessage(error, fallback);
      
      expect(message).toBe(fallback);
    });

    it('should use fallback message when error is null or undefined', () => {
      const message1 = getUserErrorMessage(null);
      const message2 = getUserErrorMessage(undefined, 'Nothing found');
      
      expect(message1).toBe('An unexpected error occurred. Please try again.');
      expect(message2).toBe('Nothing found');
    });
  });
});