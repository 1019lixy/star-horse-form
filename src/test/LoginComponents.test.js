import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import routeDefine from '@/router/routeDefine';
import Register from '@/components/Register.vue';
import ForgotPassword from '@/components/ForgotPassword.vue';

// Create a router instance for testing
const router = createRouter({
  history: createWebHistory(),
  routes: routeDefine,
});

describe('Login Components', () => {
  test('renders Register component', async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    });
    
    // Check if the component renders the registration title
    expect(wrapper.text()).toContain('立即注册');
    expect(wrapper.text()).toContain('没有账号？');
  });

  test('renders ForgotPassword component', async () => {
    const wrapper = mount(ForgotPassword, {
      global: {
        plugins: [router],
      },
    });
    
    // Check if the component renders the forgot password title
    expect(wrapper.text()).toContain('忘记密码');
  });
});