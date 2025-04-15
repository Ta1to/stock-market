import { reactive } from 'vue';

// pop up coordinator
export const PopupState = reactive({
  activePopup: null,       
  activeModalPopup: null,  
  
  activatePopup(popupName) {
    if (this.activePopup !== popupName) {
      this.activePopup = popupName;
      return true;
    }
    return false;
  },
  
  deactivatePopup(popupName) {
    if (this.activePopup === popupName) {
      this.activePopup = null;
      return true;
    }
    return false;
  },
  
  isActivePopup(popupName) {
    return this.activePopup === popupName;
  },

  // full screen pop up 
  activateModalPopup(modalName) {
    this.activeModalPopup = modalName;
    return true;
  },
  
  deactivateModalPopup(modalName) {
    if (this.activeModalPopup === modalName) {
      this.activeModalPopup = null;
      return true;
    }
    return false;
  },
  
  isAnyModalActive() {
    return this.activeModalPopup !== null;
  },
  
  isModalActive(modalName) {
    return this.activeModalPopup === modalName;
  }
});