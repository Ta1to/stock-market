import { shallowMount } from '@vue/test-utils'
import LoginView from '@/views/auth/LoginView.vue'
import { nextTick } from 'vue'

// Firebase Auth Mock
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn((auth, email, password) => {
    // Mock successful login for test@example.com/password123
    if (email === 'test@example.com' && password === 'password123') {
      return Promise.resolve({
        user: { email, uid: 'test-user-id' }
      })
    }
    
    // Mock error for other login credentials
    if (email === 'unknown@example.com') {
      return Promise.reject({ code: 'auth/user-not-found' })
    }
    
    if (email === 'test@example.com' && password !== 'password123') {
      return Promise.reject({ code: 'auth/wrong-password' })
    }
    
    return Promise.reject({ code: 'auth/generic-error' })
  })
}))

// Mock for Router
const mockRouter = {
  push: jest.fn()
}

// Create a stub for router-link component
const RouterLinkStub = {
  name: 'router-link',
  props: ['to'],
  template: '<a :href="to"><slot /></slot></a>'
}

describe('LoginView.vue', () => {
  let wrapper
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    
    // Mount component with mocks
    wrapper = shallowMount(LoginView, {
      global: {
        mocks: {
          $router: mockRouter
        },
        stubs: {
          'router-link': RouterLinkStub
        }
      }
    })
  })
  
  it('renders login form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })
    it('validates email correctly', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    
    // Empty email
    await emailInput.setValue('')
    await emailInput.trigger('blur')
    expect(wrapper.vm.emailError).toBe('Email is required')
    
    // Invalid email
    await emailInput.setValue('invalid-email')
    await emailInput.trigger('blur')
    expect(wrapper.vm.emailError).toBe('Email must be valid')
    
    // Valid email
    await emailInput.setValue('test@example.com')
    await emailInput.trigger('blur')
    expect(wrapper.vm.emailError).toBeNull()
  })
    it('validates password correctly', async () => {
    const passwordInput = wrapper.find('input[type="password"]')
    
    // Empty password
    await passwordInput.setValue('')
    await passwordInput.trigger('blur')
    expect(wrapper.vm.passwordError).toBe('Password is required')
    
    // Password too short
    await passwordInput.setValue('12345')
    await passwordInput.trigger('blur')
    expect(wrapper.vm.passwordError).toBe('Password must be at least 6 characters')
    
    // Valid password
    await passwordInput.setValue('123456')
    await passwordInput.trigger('blur')
    expect(wrapper.vm.passwordError).toBeNull()
  })
    it('toggles password visibility when clicking eye icon', async () => {
    expect(wrapper.vm.showPassword).toBe(false)
    
    // Click on the eye icon
    await wrapper.find('.password-toggle').trigger('click')
    expect(wrapper.vm.showPassword).toBe(true)
    
    // Click again
    await wrapper.find('.password-toggle').trigger('click')
    expect(wrapper.vm.showPassword).toBe(false)
  })
    it('logs in successfully with valid credentials', async () => {
    // Set email and password
    await wrapper.setData({
      email: 'test@example.com',
      password: 'password123'
    })
      // Mock validateForm to return true
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Call login method
    await wrapper.vm.login()
    
    // Check if router.push was called
    expect(mockRouter.push).toHaveBeenCalledWith('/')
    expect(wrapper.vm.error).toBeNull()
  })
  
  it('shows "user not found" error with non-existent email', async () => {
    // Set email and password
    await wrapper.setData({
      email: 'unknown@example.com',
      password: 'anypassword'
    })
    
    // Mock validateForm to return true
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Call login method
    await wrapper.vm.login()
    
    // Check the displayed error message
    expect(wrapper.vm.error).toBe('No account found with this email')
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
  
  it('shows "invalid password" error with wrong password', async () => {
    // Set email and password
    await wrapper.setData({
      email: 'test@example.com',
      password: 'wrongpassword'
    })
    
    // Mock validateForm to return true
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Call login method    
    await wrapper.vm.login()
    
    // Check the displayed error message
    expect(wrapper.vm.error).toBe('Invalid password')
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
  
  it('shows generic error message for other errors', async () => {
    // Set email and password
    await wrapper.setData({
      email: 'error@example.com',
      password: 'errorpassword'
    })
    
    // Mock validateForm to return true
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Call login method
    await wrapper.vm.login()
    
    // Check the displayed error message
    expect(wrapper.vm.error).toBe('An error occurred during sign in')
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
  
  it('does not submit if form validation fails', async () => {
    // Mock validateForm to return false
    wrapper.vm.validateForm = jest.fn().mockReturnValue(false)
    
    // Call login method
    await wrapper.vm.login()
    
    // Check that Firebase sign-in was not called
    expect(require('firebase/auth').signInWithEmailAndPassword).not.toHaveBeenCalled()
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
  
  it('triggers email validation when email changes', async () => {
    // Setup validator spy
    const validateEmailSpy = jest.spyOn(wrapper.vm, 'validateEmail')
    
    // Set a valid email directly
    await wrapper.setData({ email: 'test@example.com' })
    
    // Check if validateEmail was called by the watcher
    expect(validateEmailSpy).toHaveBeenCalled()
  })
})