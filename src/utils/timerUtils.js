/**
 * Timer utility functions for components that need countdown timers
 */

/**
 * Creates a countdown timer with cleanup
 * @param {Number} startTime - The starting time in seconds
 * @param {Function} onTick - Callback executed on each tick, receives remaining time
 * @param {Function} onComplete - Callback executed when timer reaches zero
 * @returns {Object} Timer control object with start, stop, and reset methods
 */
export const useTimer = (startTime, onTick, onComplete) => {
  let timerInterval = null;
  let remainingTime = startTime;

  const start = () => {
    if (timerInterval) return;
    
    remainingTime = startTime;
    onTick && onTick(remainingTime);
    
    timerInterval = setInterval(() => {
      remainingTime--;
      onTick && onTick(remainingTime);
      
      if (remainingTime <= 0) {
        stop();
        onComplete && onComplete();
      }
    }, 1000);
  };

  const stop = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };
  
  const reset = () => {
    stop();
    remainingTime = startTime;
    onTick && onTick(remainingTime);
  };

  return {
    start,
    stop,
    reset,
    get isRunning() {
      return !!timerInterval;
    },
    get time() {
      return remainingTime;
    }
  };
};