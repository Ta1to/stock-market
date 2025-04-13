import { useTimer } from '@/utils/timerUtils';

describe('timerUtils', () => {
  // Mock timing functions
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    jest.spyOn(global, 'clearInterval');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('useTimer', () => {
    it('should create a timer with correct initial state', () => {
      const startTime = 10;
      const timer = useTimer(startTime);
      
      expect(timer.isRunning).toBe(false);
      expect(timer.time).toBe(startTime);
    });

    it('should call onTick callback with remaining time when started', () => {
      const startTime = 10;
      const onTick = jest.fn();
      const timer = useTimer(startTime, onTick);

      timer.start();

      // Initial tick
      expect(onTick).toHaveBeenCalledWith(startTime);
      expect(timer.isRunning).toBe(true);
      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    });

    it('should decrement time and call onTick on each interval', () => {
      const startTime = 3;
      const onTick = jest.fn();
      const timer = useTimer(startTime, onTick);

      timer.start();
      
      // Initial tick
      expect(onTick).toHaveBeenLastCalledWith(3);
      expect(timer.time).toBe(3);

      // Advance by 1 second
      jest.advanceTimersByTime(1000);
      expect(timer.time).toBe(2);
      expect(onTick).toHaveBeenLastCalledWith(2);

      // Advance by 1 more second
      jest.advanceTimersByTime(1000);
      expect(timer.time).toBe(1);
      expect(onTick).toHaveBeenLastCalledWith(1);
    });

    it('should call onComplete and stop when timer reaches zero', () => {
      const startTime = 2;
      const onTick = jest.fn();
      const onComplete = jest.fn();
      const timer = useTimer(startTime, onTick, onComplete);

      timer.start();
      
      // Advance to completion
      jest.advanceTimersByTime(2000);
      
      expect(timer.time).toBe(0);
      expect(onTick).toHaveBeenLastCalledWith(0);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(timer.isRunning).toBe(false);
      expect(clearInterval).toHaveBeenCalled();
    });

    it('should not start multiple timers if already running', () => {
      const startTime = 5;
      const onTick = jest.fn();
      const timer = useTimer(startTime, onTick);

      timer.start();
      timer.start(); // Second call should be ignored

      expect(setInterval).toHaveBeenCalledTimes(1);
    });

    it('should stop the timer when stop is called', () => {
      const startTime = 5;
      const timer = useTimer(startTime);

      timer.start();
      expect(timer.isRunning).toBe(true);

      timer.stop();
      expect(timer.isRunning).toBe(false);
      expect(clearInterval).toHaveBeenCalled();
    });

    it('should reset the timer to initial state', () => {
      const startTime = 5;
      const onTick = jest.fn();
      const timer = useTimer(startTime, onTick);

      timer.start();
      jest.advanceTimersByTime(2000); // Decrement to 3
      expect(timer.time).toBe(3);

      timer.reset();
      
      expect(timer.time).toBe(startTime);
      expect(timer.isRunning).toBe(false);
      expect(onTick).toHaveBeenLastCalledWith(startTime);
      expect(clearInterval).toHaveBeenCalled();
    });

    it('should handle missing callbacks gracefully', () => {
      const startTime = 2;
      const timer = useTimer(startTime); // No callbacks

      // These should not throw errors
      timer.start();
      jest.advanceTimersByTime(3000); // Complete timer
      timer.stop();
      timer.reset();
    });
  });
});