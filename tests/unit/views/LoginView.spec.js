import { shallowMount } from '@vue/test-utils'
import LoginView from '@/views/auth/LoginView.vue'
import { nextTick } from 'vue'

// Firebase Auth Mock
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn((auth, email, password) => {
    // Mock erfolgreiche Anmeldung für test@example.com/password123
    if (email === 'test@example.com' && password === 'password123') {
      return Promise.resolve({
        user: { email, uid: 'test-user-id' }
      })
    }
    
    // Mock Fehler für andere Anmeldedaten
    if (email === 'unknown@example.com') {
      return Promise.reject({ code: 'auth/user-not-found' })
    }
    
    if (email === 'test@example.com' && password !== 'password123') {
      return Promise.reject({ code: 'auth/wrong-password' })
    }
    
    return Promise.reject({ code: 'auth/generic-error' })
  })
}))

// Mock für Router
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
    // Reset Mocks vor jedem Test
    jest.clearAllMocks()
    
    // Mount-Komponente mit Mocks
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
    
    // Leere Email
    await emailInput.setValue('')
    await emailInput.trigger('blur')
    expect(wrapper.vm.emailError).toBe('Email is required')
    
    // Ungültige Email
    await emailInput.setValue('invalid-email')
    await emailInput.trigger('blur')
    expect(wrapper.vm.emailError).toBe('Email must be valid')
    
    // Gültige Email
    await emailInput.setValue('test@example.com')
    await emailInput.trigger('blur')
    expect(wrapper.vm.emailError).toBeNull()
  })
  
  it('validates password correctly', async () => {
    const passwordInput = wrapper.find('input[type="password"]')
    
    // Leeres Passwort
    await passwordInput.setValue('')
    await passwordInput.trigger('blur')
    expect(wrapper.vm.passwordError).toBe('Password is required')
    
    // Zu kurzes Passwort
    await passwordInput.setValue('12345')
    await passwordInput.trigger('blur')
    expect(wrapper.vm.passwordError).toBe('Password must be at least 6 characters')
    
    // Gültiges Passwort
    await passwordInput.setValue('123456')
    await passwordInput.trigger('blur')
    expect(wrapper.vm.passwordError).toBeNull()
  })
  
  it('toggles password visibility when clicking eye icon', async () => {
    expect(wrapper.vm.showPassword).toBe(false)
    
    // Klicke auf das Augen-Icon
    await wrapper.find('.password-toggle').trigger('click')
    expect(wrapper.vm.showPassword).toBe(true)
    
    // Klicke erneut
    await wrapper.find('.password-toggle').trigger('click')
    expect(wrapper.vm.showPassword).toBe(false)
  })
  
  it('logs in successfully with valid credentials', async () => {
    // Setze Email und Passwort
    await wrapper.setData({
      email: 'test@example.com',
      password: 'password123'
    })
    
    // Mock validateForm, um true zurückzugeben
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Rufe Login-Methode auf
    await wrapper.vm.login()
    
    // Überprüfe, ob Router.push aufgerufen wurde
    expect(mockRouter.push).toHaveBeenCalledWith('/')
    expect(wrapper.vm.error).toBeNull()
  })
  
  it('shows "user not found" error with non-existent email', async () => {
    // Setze Email und Passwort
    await wrapper.setData({
      email: 'unknown@example.com',
      password: 'anypassword'
    })
    
    // Mock validateForm, um true zurückzugeben
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Rufe Login-Methode auf
    await wrapper.vm.login()
    
    // Überprüfe die angezeigte Fehlermeldung
    expect(wrapper.vm.error).toBe('No account found with this email')
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
  
  it('shows "invalid password" error with wrong password', async () => {
    // Setze Email und Passwort
    await wrapper.setData({
      email: 'test@example.com',
      password: 'wrongpassword'
    })
    
    // Mock validateForm, um true zurückzugeben
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Rufe Login-Methode auf
    await wrapper.vm.login()
    
    // Überprüfe die angezeigte Fehlermeldung
    expect(wrapper.vm.error).toBe('Invalid password')
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
  
  it('shows generic error message for other errors', async () => {
    // Setze Email und Passwort
    await wrapper.setData({
      email: 'error@example.com',
      password: 'errorpassword'
    })
    
    // Mock validateForm, um true zurückzugeben
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Rufe Login-Methode auf
    await wrapper.vm.login()
    
    // Überprüfe die angezeigte Fehlermeldung
    expect(wrapper.vm.error).toBe('An error occurred during sign in')
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
  
  it('does not submit if form validation fails', async () => {
    // Mock validateForm, um false zurückzugeben
    wrapper.vm.validateForm = jest.fn().mockReturnValue(false)
    
    // Rufe Login-Methode auf
    await wrapper.vm.login()
    
    // Überprüfe, ob Firebase-Anmeldung nicht aufgerufen wurde
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