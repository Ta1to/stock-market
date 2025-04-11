import { reactive } from 'vue';

// pop up coordinator
export const PopupState = reactive({
  activePopup: null,       
  activeModalPopup: null,  
  
  activatePopup(popupName) {
    console.log(`Aktiviere Pop-up: ${popupName}, war vorher: ${this.activePopup}`);
    if (this.activePopup !== popupName) {
      this.activePopup = popupName;
      return true;
    }
    return false;
  },
  
  deactivatePopup(popupName) {
    console.log(`Deaktiviere Pop-up: ${popupName}`);
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
    console.log(`Aktiviere Modal-Popup: ${modalName}`);
    this.activeModalPopup = modalName;
    return true;
  },
  
  deactivateModalPopup(modalName) {
    console.log(`Deaktiviere Modal-Popup: ${modalName}`);
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