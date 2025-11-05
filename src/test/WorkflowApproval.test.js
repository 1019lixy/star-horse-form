import { mount } from '@vue/test-utils';
import WorkflowApproval from '@/views/workflow/WorkflowApproval.vue';
import { i18n } from '@/lang';

// Mock the star-horse-lowcode dependency
jest.mock('star-horse-lowcode', () => ({
  apiInstance: jest.fn().mockReturnValue({
    pageListUrl: '/api/workflow/approval/pageList'
  }),
  dialogPreps: jest.fn().mockReturnValue({
    viewVisible: false
  })
}));

describe('WorkflowApproval', () => {
  test('renders workflow approval component', () => {
    const wrapper = mount(WorkflowApproval, {
      global: {
        mocks: {
          $t: i18n
        }
      }
    });
    
    // Check if the component renders
    expect(wrapper.exists()).toBe(true);
  });

  test('contains workflow design label', () => {
    const wrapper = mount(WorkflowApproval, {
      global: {
        mocks: {
          $t: i18n
        }
      }
    });
    
    // Check if the component contains workflow related text
    expect(wrapper.text()).toContain('Process Name');
  });
});