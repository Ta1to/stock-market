import { shallowMount } from '@vue/test-utils'
import RegisterView from '@/views/auth/RegisterView.vue'

// Firebase Auth Mock
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  createUserWithEmailAndPassword: jest.fn((auth, email, password) => {
    if (email === 'existing@example.com') {
      return Promise.reject({ code: 'auth/email-already-in-use' })
    }
    if (email === 'invalid@example') {
      return Promise.reject({ code: 'auth/invalid-email' })
    }
    if (password === '12345') {
      return Promise.reject({ code: 'auth/weak-password' })
    }
    return Promise.resolve({
      user: { email, uid: 'new-user-id' }
    })
  })
}))

// Database Service Mock
jest.mock('@/services/database', () => ({
  writeData: jest.fn().mockResolvedValue(true)
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

describe('RegisterView.vue', () => {
  let wrapper
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    
    // Mount component with mocks
    wrapper = shallowMount(RegisterView, {
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
  
  it('renders register form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[id="name"]').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })
    it('validates name correctly', async () => {
    const nameInput = wrapper.find('input[id="name"]')
    
    // Empty name
    await nameInput.setValue('')
    await nameInput.trigger('blur')
    expect(wrapper.vm.nameError).toBe('Name is required')
    
    // Name too short
    await nameInput.setValue('J')
    await nameInput.trigger('blur')
    expect(wrapper.vm.nameError).toBe('Name must be at least 2 characters')
    
    // Valid name
    await nameInput.setValue('John')
    await nameInput.trigger('blur')
    expect(wrapper.vm.nameError).toBeNull()
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
  
  it('registers successfully with valid credentials', async () => {
    const testUser = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    }
    
    // Set form values
    await wrapper.setData(testUser)
    
    // Mock validateForm to return true
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Call register method
    await wrapper.vm.register()
    
    // Check Firebase call
    const { createUserWithEmailAndPassword, getAuth } = require('firebase/auth')
    expect(createUserWithEmailAndPassword).toHaveBeenCalled()
      // Check database call
    const { writeData } = require('@/services/database')
    expect(writeData).toHaveBeenCalledWith(
      'users/new-user-id',
      expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com'
      })
    )
    
    // Check redirection
    expect(mockRouter.push).toHaveBeenCalledWith('/')
    expect(wrapper.vm.error).toBeNull()
  })
  
  it('shows error for already used email', async () => {    // Set form values
    await wrapper.setData({
      name: 'John Doe',
      email: 'existing@example.com',
      password: 'password123'
    })
    
    // Mock validateForm to return true
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Call register method
    await wrapper.vm.register()
    
    // Check error message
    expect(wrapper.vm.error).toBe('This email is already registered')
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
  
  it('shows error for invalid email', async () => {    // Set form values
    await wrapper.setData({
      name: 'John Doe',
      email: 'invalid@example',
      password: 'password123'
    })
    
    // Mock validateForm to return true
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Call register method
    await wrapper.vm.register()
    
    // Check error message
    expect(wrapper.vm.error).toBe('Invalid email address')
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
  
  it('shows error for weak password', async () => {
    // Setze Formularwerte
    await wrapper.setData({
      name: 'John Doe',
      email: 'john@example.com',
      password: '12345'
    })
      // Mock validateForm to return true
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Call register method
    await wrapper.vm.register()
    
    // Check error message
    expect(wrapper.vm.error).toBe('Password is too weak')
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
  
  it('does not submit if form validation fails', async () => {
    // Mock validateForm to return false
    wrapper.vm.validateForm = jest.fn().mockReturnValue(false)
    
    // Call register method
    await wrapper.vm.register()
    
    // Check that Firebase registration was not called
    expect(require('firebase/auth').createUserWithEmailAndPassword).not.toHaveBeenCalled()
    expect(mockRouter.push).not.toHaveBeenCalled()
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
})