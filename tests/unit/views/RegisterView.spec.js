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

describe('RegisterView.vue', () => {
  let wrapper
  
  beforeEach(() => {
    // Reset Mocks vor jedem Test
    jest.clearAllMocks()
    
    // Mount-Komponente mit Mocks
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
    
    // Leerer Name
    await nameInput.setValue('')
    await nameInput.trigger('blur')
    expect(wrapper.vm.nameError).toBe('Name is required')
    
    // Zu kurzer Name
    await nameInput.setValue('J')
    await nameInput.trigger('blur')
    expect(wrapper.vm.nameError).toBe('Name must be at least 2 characters')
    
    // Gültiger Name
    await nameInput.setValue('John')
    await nameInput.trigger('blur')
    expect(wrapper.vm.nameError).toBeNull()
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
  
  it('registers successfully with valid credentials', async () => {
    const testUser = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    }
    
    // Setze Formularwerte
    await wrapper.setData(testUser)
    
    // Mock validateForm, um true zurückzugeben
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Rufe Register-Methode auf
    await wrapper.vm.register()
    
    // Überprüfe Firebase-Aufruf
    const { createUserWithEmailAndPassword, getAuth } = require('firebase/auth')
    expect(createUserWithEmailAndPassword).toHaveBeenCalled()
    
    // Überprüfe Datenbankaufruf
    const { writeData } = require('@/services/database')
    expect(writeData).toHaveBeenCalledWith(
      'users/new-user-id',
      expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com'
      })
    )
    
    // Überprüfe Weiterleitung
    expect(mockRouter.push).toHaveBeenCalledWith('/')
    expect(wrapper.vm.error).toBeNull()
  })
  
  it('shows error for already used email', async () => {
    // Setze Formularwerte
    await wrapper.setData({
      name: 'John Doe',
      email: 'existing@example.com',
      password: 'password123'
    })
    
    // Mock validateForm, um true zurückzugeben
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Rufe Register-Methode auf
    await wrapper.vm.register()
    
    // Überprüfe Fehlermeldung
    expect(wrapper.vm.error).toBe('This email is already registered')
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
  
  it('shows error for invalid email', async () => {
    // Setze Formularwerte
    await wrapper.setData({
      name: 'John Doe',
      email: 'invalid@example',
      password: 'password123'
    })
    
    // Mock validateForm, um true zurückzugeben
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Rufe Register-Methode auf
    await wrapper.vm.register()
    
    // Überprüfe Fehlermeldung
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
    
    // Mock validateForm, um true zurückzugeben
    wrapper.vm.validateForm = jest.fn().mockReturnValue(true)
    
    // Rufe Register-Methode auf
    await wrapper.vm.register()
    
    // Überprüfe Fehlermeldung
    expect(wrapper.vm.error).toBe('Password is too weak')
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
  
  it('does not submit if form validation fails', async () => {
    // Mock validateForm, um false zurückzugeben
    wrapper.vm.validateForm = jest.fn().mockReturnValue(false)
    
    // Rufe Register-Methode auf
    await wrapper.vm.register()
    
    // Überprüfe, ob Firebase-Registrierung nicht aufgerufen wurde
    expect(require('firebase/auth').createUserWithEmailAndPassword).not.toHaveBeenCalled()
    expect(mockRouter.push).not.toHaveBeenCalled()
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
})