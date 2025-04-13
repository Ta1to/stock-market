import { PopupState } from '@/utils/popupEventBus';

describe('PopupEventBus', () => {
  beforeEach(() => {
    // Reset the popup state before each test
    PopupState.activePopup = null;
    PopupState.activeModalPopup = null;
    // Mock console.log to prevent cluttering test output
    console.log = jest.fn();
  });

  describe('Regular Popup Management', () => {
    it('should activate a popup', () => {
      const result = PopupState.activatePopup('testPopup');
      expect(result).toBe(true);
      expect(PopupState.activePopup).toBe('testPopup');
    });

    it('should not reactivate an already active popup', () => {
      // First activation
      PopupState.activatePopup('testPopup');
      
      // Try to activate again
      const result = PopupState.activatePopup('testPopup');
      expect(result).toBe(false);
      expect(PopupState.activePopup).toBe('testPopup');
    });

    it('should deactivate an active popup', () => {
      // Activate first
      PopupState.activatePopup('testPopup');
      
      // Then deactivate
      const result = PopupState.deactivatePopup('testPopup');
      expect(result).toBe(true);
      expect(PopupState.activePopup).toBeNull();
    });

    it('should not deactivate an inactive popup', () => {
      // Activate a different popup
      PopupState.activatePopup('otherPopup');
      
      // Try to deactivate a popup that is not active
      const result = PopupState.deactivatePopup('testPopup');
      expect(result).toBe(false);
      expect(PopupState.activePopup).toBe('otherPopup');
    });

    it('should check if a popup is active', () => {
      PopupState.activatePopup('testPopup');
      
      expect(PopupState.isActivePopup('testPopup')).toBe(true);
      expect(PopupState.isActivePopup('otherPopup')).toBe(false);
    });
  });

  describe('Modal Popup Management', () => {
    it('should activate a modal popup', () => {
      const result = PopupState.activateModalPopup('testModal');
      expect(result).toBe(true);
      expect(PopupState.activeModalPopup).toBe('testModal');
    });

    it('should deactivate an active modal popup', () => {
      // Activate first
      PopupState.activateModalPopup('testModal');
      
      // Then deactivate
      const result = PopupState.deactivateModalPopup('testModal');
      expect(result).toBe(true);
      expect(PopupState.activeModalPopup).toBeNull();
    });

    it('should not deactivate an inactive modal popup', () => {
      // Activate a different modal
      PopupState.activateModalPopup('otherModal');
      
      // Try to deactivate a modal that is not active
      const result = PopupState.deactivateModalPopup('testModal');
      expect(result).toBe(false);
      expect(PopupState.activeModalPopup).toBe('otherModal');
    });

    it('should check if any modal is active', () => {
      expect(PopupState.isAnyModalActive()).toBe(false);
      
      PopupState.activateModalPopup('testModal');
      expect(PopupState.isAnyModalActive()).toBe(true);
    });

    it('should check if a specific modal is active', () => {
      PopupState.activateModalPopup('testModal');
      
      expect(PopupState.isModalActive('testModal')).toBe(true);
      expect(PopupState.isModalActive('otherModal')).toBe(false);
    });
  });

  describe('Popup and Modal Interaction', () => {
    it('should manage regular and modal popups independently', () => {
      // Activate both types
      PopupState.activatePopup('testPopup');
      PopupState.activateModalPopup('testModal');
      
      // Check both are active
      expect(PopupState.activePopup).toBe('testPopup');
      expect(PopupState.activeModalPopup).toBe('testModal');
      
      // Deactivate regular popup shouldn't affect modal
      PopupState.deactivatePopup('testPopup');
      expect(PopupState.activePopup).toBeNull();
      expect(PopupState.activeModalPopup).toBe('testModal');
    });
  });
});