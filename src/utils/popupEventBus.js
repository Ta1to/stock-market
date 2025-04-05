import { reactive } from 'vue';

// pop up coordinator
export const PopupState = reactive({
  activePopup: null, 
  
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
  }
});