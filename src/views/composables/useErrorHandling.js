import { ref, watch } from 'vue';

export function useErrorHandling(gameStore) {
  const errorTimeout = ref(null);
  
  // Watch for error message changes and auto-dismiss after timeout
  watch(() => gameStore.errorMessage, (newMessage) => {
    // Clear any existing timeout
    if (errorTimeout.value) {
      clearTimeout(errorTimeout.value);
      errorTimeout.value = null;
    }
    
    // If there's a new error message, set a timeout to clear it
    if (newMessage) {
      errorTimeout.value = setTimeout(() => {
        gameStore.errorMessage = null;
      }, 5000); // 5 seconds
    }
  });
  
  return {
    errorTimeout
  };
}