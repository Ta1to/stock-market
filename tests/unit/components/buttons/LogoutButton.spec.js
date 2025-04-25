import { mount } from '@vue/test-utils';
import LogoutButton from '@/components/buttons/LogoutButton.vue';
import { getAuth, signOut } from 'firebase/auth';

// Mock Firebase auth modules
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signOut: jest.fn()
}));

describe('LogoutButton.vue', () => {
  let mockRouter;
  let mockAuth;
  
  beforeEach(() => {
    // Setup mocks
    mockAuth = {};
    mockRouter = {
      push: jest.fn()
    };
    
    getAuth.mockReturnValue(mockAuth);
    signOut.mockResolvedValue();
    
    // Mock console.error
    console.error = jest.fn();
  });
  
  it('renders a logout button', () => {
    const wrapper = mount(LogoutButton, {
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    });
    
    expect(wrapper.find('.logout-button').exists()).toBe(true);
    expect(wrapper.text()).toBe('LOGOUT');
  });
  
  it('calls logout method when button is clicked', async () => {
    const wrapper = mount(LogoutButton, {
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    });
    
    const logoutSpy = jest.spyOn(wrapper.vm, 'logout');
    
    await wrapper.find('.logout-button').trigger('click');
    
    expect(logoutSpy).toHaveBeenCalled();
  });
  
  it('signs out the user and redirects to login page on success', async () => {
    const wrapper = mount(LogoutButton, {
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    });
    
    await wrapper.find('.logout-button').trigger('click');
    
    expect(getAuth).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalledWith(mockAuth);
    
    // Wait for the promise to resolve
    await new Promise(process.nextTick);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });
  
  it('handles errors during sign-out', async () => {
    const error = new Error('Sign out failed');
    signOut.mockRejectedValueOnce(error);
    
    const wrapper = mount(LogoutButton, {
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    });
    
    await wrapper.find('.logout-button').trigger('click');
    
    // Wait for the promise to reject
    await new Promise(process.nextTick);
    
    expect(console.error).toHaveBeenCalledWith('Error logging out: ', error);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});