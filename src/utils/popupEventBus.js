import { reactive } from 'vue';

/**
 * Popup state management system for coordinating popup displays across the application
 * Handles both regular popups and full-screen modal popups
 */
export const PopupState = reactive({
  activePopup: null,       // Currently active regular popup
  activeModalPopup: null,  // Currently active modal popup
  
  /**
   * Activates a popup by name
   * @param {string} popupName - The name of the popup to activate
   * @returns {boolean} Success indicator
   */
  activatePopup(popupName) {
    if (this.activePopup !== popupName) {
      this.activePopup = popupName;
      return true;
    }
    return false;
  },
  
  /**
   * Deactivates a popup by name
   * @param {string} popupName - The name of the popup to deactivate
   * @returns {boolean} Success indicator
   */
  deactivatePopup(popupName) {
    if (this.activePopup === popupName) {
      this.activePopup = null;
      return true;
    }
    return false;
  },
  
  /**
   * Checks if a popup is currently active
   * @param {string} popupName - The name of the popup to check
   * @returns {boolean} True if the specified popup is active
   */
  isActivePopup(popupName) {
    return this.activePopup === popupName;
  },

  /**
   * Activates a full-screen modal popup
   * @param {string} modalName - The name of the modal to activate
   * @returns {boolean} Always returns true
   */
  activateModalPopup(modalName) {
    this.activeModalPopup = modalName;
    return true;
  },
  
  /**
   * Deactivates a full-screen modal popup
   * @param {string} modalName - The name of the modal to deactivate
   * @returns {boolean} Success indicator
   */
  deactivateModalPopup(modalName) {
    if (this.activeModalPopup === modalName) {
      this.activeModalPopup = null;
      return true;
    }
    return false;
  },
  
  /**
   * Checks if any modal is currently active
   * @returns {boolean} True if any modal is active
   */
  isAnyModalActive() {
    return this.activeModalPopup !== null;
  },
  
  /**
   * Checks if a specific modal is currently active
   * @param {string} modalName - The name of the modal to check
   * @returns {boolean} True if the specified modal is active
   */
  isModalActive(modalName) {
    return this.activeModalPopup === modalName;
  }
});