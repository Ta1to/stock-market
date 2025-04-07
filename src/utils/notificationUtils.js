/**
 * Notification utility for managing app-wide notifications
 * Uses a publish-subscribe pattern to keep components decoupled
 */

// Event types
export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Event bus for notifications
class NotificationBus {
  constructor() {
    this.listeners = [];
  }

  /**
   * Subscribe to notifications
   * @param {Function} callback - Callback to execute when notification is published
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Publish a notification to all subscribers
   * @param {Object} notification - Notification object
   */
  publish(notification) {
    this.listeners.forEach(listener => listener(notification));
  }
}

// Create a singleton instance
const notificationBus = new NotificationBus();

/**
 * Show a notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {number} timeout - Auto-dismiss timeout in milliseconds
 */
export const notify = (message, type = NotificationType.INFO, timeout = 5000) => {
  notificationBus.publish({
    message,
    type,
    timeout,
    timestamp: Date.now()
  });
};

/**
 * Show a success notification
 * @param {string} message - Success message
 * @param {number} timeout - Auto-dismiss timeout in milliseconds
 */
export const notifySuccess = (message, timeout = 5000) => {
  notify(message, NotificationType.SUCCESS, timeout);
};

/**
 * Show an error notification
 * @param {string} message - Error message
 * @param {number} timeout - Auto-dismiss timeout in milliseconds
 */
export const notifyError = (message, timeout = 8000) => {
  notify(message, NotificationType.ERROR, timeout);
};

/**
 * Show a warning notification
 * @param {string} message - Warning message
 * @param {number} timeout - Auto-dismiss timeout in milliseconds
 */
export const notifyWarning = (message, timeout = 6000) => {
  notify(message, NotificationType.WARNING, timeout);
};

/**
 * Show an info notification
 * @param {string} message - Info message
 * @param {number} timeout - Auto-dismiss timeout in milliseconds
 */
export const notifyInfo = (message, timeout = 5000) => {
  notify(message, NotificationType.INFO, timeout);
};

/**
 * Subscribe to notifications
 * @param {Function} callback - Callback to execute when notification is published
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNotifications = (callback) => {
  return notificationBus.subscribe(callback);
};

export default {
  notify,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  subscribeToNotifications,
  NotificationType
};