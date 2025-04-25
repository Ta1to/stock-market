import { shallowMount } from '@vue/test-utils';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from '@/App.vue';

// Create a mock router - using hash history instead of web history to avoid URL issues in tests
const createMockRouter = () => {
  const routes = [
    { path: '/', component: { template: '<div>Home Mock</div>' } }
  ];
  
  return createRouter({
    history: createWebHashHistory(),
    routes
  });
};

describe('App.vue', () => {
  it('has the correct name', () => {
    const wrapper = shallowMount(App, {
      global: {
        stubs: {
          'router-view': true,
          'v-app': true,
          'v-main': true
        },
        plugins: [createMockRouter()]
      }
    });
    
    expect(wrapper.vm.$options.name).toBe('StockPoker');
  });

  it('contains v-app component', () => {
    const wrapper = shallowMount(App, {
      global: {
        stubs: {
          'router-view': true,
          'v-app': true,
          'v-main': true
        },
        plugins: [createMockRouter()]
      }
    });
    
    expect(wrapper.find('v-app-stub').exists()).toBe(true);
  });
});