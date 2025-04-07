import { ref } from 'vue';

export function useGamePhases() {
  // Popup management
  const showPopup = ref(false);

  function openPopup() {
    showPopup.value = true;
  }
  
  function closePopup() {
    showPopup.value = false;
  }

  return {
    showPopup,
    openPopup,
    closePopup
  };
}