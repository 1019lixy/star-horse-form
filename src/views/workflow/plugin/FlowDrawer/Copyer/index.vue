<template>
  <el-drawer
      v-if="node.approverGroups"
      :width="scale.isMobile() ? '100%' : '40%'"
      :headerStyle="headerStyle"
      :bodyStyle="flowMixin.bodyStyle"
      placement="right"
      :closable="true"
      v-model="visible"
      :after-visible-change="afterVisibleChange"
      @close="onClose"
  >
    <template #header>
      <div class="drawer-header">
        <img :src="flowMixin.ccIcon" class="anticon"/>
        <span class="flow-drawer-title">
        <EditName v-model:nodeName="node.name"/>
      </span>
      </div>
    </template>
    <div class="flow-setting-module">
      <el-tabs v-model="copyerTab">
        <el-tab-pane key="1" name="1" label="抄送设置">
          <div class="flow-setting-content">
            <div class="flow-setting-item">
              <p class="flow-setting-item-title">抄送人</p>
              <FlowNodeApproval :groups="node.approverGroups" :node="node" title="抄送人"/>
            </div>
            <div class="flow-setting-item">
              <p class="flow-setting-item-title">提示：</p>
              <div class="hint-info">
                <p>抄送的人数最多支持100人以内</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane key="2" name="2" label="表单权限">
          <div class="flow-setting-content">
            <div class="flow-setting-item">
              <p class="flow-setting-item-title">表单权限</p>
              <AuthForm v-model="node.privileges"/>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane key="3" name="3" label="高级设置">
          <FlowNodeCopyerConfigure v-model="node.configure"/>
        </el-tab-pane>
      </el-tabs>
    </div>
    <p>{{ node }}</p>
    <FlowDrawerFooter @close="onClose" @save="onSave"/>
  </el-drawer>
</template>
<script setup lang="ts">
import {flowMixin} from '@/views/workflow/plugin/mixins/flowMixin';
import FlowDrawerFooter from '@/views/workflow/plugin/Common/DrawerFooter.vue';
import EditName from '@/views/workflow/plugin/Common/EditName.vue';
import AuthForm from '@/views/workflow/plugin/Common/AuthForm.vue';
import FlowNodeApproval from '../Approver/Approval.vue';
import FlowNodeCopyerConfigure from './Configure.vue';
import {ref} from "vue";
import {scale} from "@/views/workflow/plugin/util/deviceUtil";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";

const emits = defineEmits(["close"]);
let node = ref<any>({});
let visible = ref<boolean>(false);
let copyerTab = ref<string>("1");
let headerStyle = ref<any>({
  background: 'linear-gradient(90.04deg,#268bfb -16.37%,#33e1ae 137.34%)',
  // 'background-color': '#6da4f2',
  'border-radius': '0px 0px 0 0',
});
let approvals = ref<Array<any>>([
  {
    name: '上级',
    value: 1,
  },
  {
    name: '部门负责人',
    value: 2,
    popovers: [
      {
        title: '什么是部门负责人审批？',
        content: '这里指在管理后台 - 组织架构中所设置的部门负责人',
      },
      {
        title: '什么是部门负责人审批？',
        content:
            '部门负责人审批与上级审批的区别？一个部门内可能存在多层的上下级关系，但通常有指定的部门负责人。由部门负责人审批 ，则不涉及上下级关系，直接由该固定人员进行审批',
      },
    ],
    href: 'https://www.feishu.cn/hc/zh-CN/articles/360044810913',
    hrefName: '如何配置部门负责人？',
  },
  {
    name: '角色',
    value: 3,
    popovers: [
      {
        title: '什么是角色？',
        content: '角色指团队成员的专业分工类别，如人事、行政、财务等，每类角色可由 1 位或多位成员组成',
      },
      {
        title: '如何使用？',
        content: '用角色作为审批人，当有成员离职变动时，该角色中的其他成员可继续完成审批，从而避免审批流程失效的情况',
      },
      {
        content: '提示：若选择的角色中包含多名成员，则按照设置“多人审批时采用的审批方式”来处理',
      },
    ],
    href: 'https://www.feishu.cn/hc/zh-CN/articles/360044810913',
    hrefName: '如何配置角色？',
  },
  {
    name: '岗位',
    value: 4,
    popovers: [
      {
        title: '什么是角色？',
        content: '角色指团队成员的专业分工类别，如人事、行政、财务等，每类角色可由 1 位或多位成员组成',
      },
      {
        title: '如何使用？',
        content: '用角色作为审批人，当有成员离职变动时，该角色中的其他成员可继续完成审批，从而避免审批流程失效的情况',
      },
      {
        content: '提示：若选择的角色中包含多名成员，则按照设置“多人审批时采用的审批方式”来处理',
      },
    ],
    href: 'https://www.feishu.cn/hc/zh-CN/articles/360044810913',
    hrefName: '如何配置角色？',
  },
  {
    name: '用户组',
    value: 5,
    popovers: [
      {
        title: '什么是用户组？',
        content: '用户组主要用于权限管控，设置某个用户组作为审批人，则只有该用户组中的成员可进行审批。',
      },
      {
        title: '如何使用？',
        content: '用户组主要用于权限管控，设置某个用户组作为审批人，则只有该用户组中的成员可进行审批。',
      },
      {
        content: '提示：若选择的用户组中包含多名成员，则按照设置“多人审批时采用的审批方式”来处理',
      },
    ],
    href: 'https://www.feishu.cn/hc/zh-CN/articles/360044810913',
    hrefName: '如何配置用户组？',
  },
  {
    name: '指定成员',
    value: 6,
  },
  {
    name: '发起人自选',
    value: 7,
  },
  {
    name: '发起人自己',
    value: 8,
    popovers: [
      {
        title: '什么是发起人审批？',
        content: '将发起人自己设置为审批人，可用于需要发起人进行信息复核的场景',
      },
    ],
  },
  {
    name: '连续多级上级审批',
    value: 9,
    popovers: [
      {
        title: '什么是连续多级上级审批？',
        content: '从发起人的直属上级开始，依次逐级向上审批，直到所设置的审批终点为止。是手动逐个添加多级上级审批的一种便捷设置',
      },
    ],
    href: 'https://www.feishu.cn/hc/zh-CN/articles/360044810913',
    hrefName: '查看和设置上级信息',
  },
  {
    name: '表单内联系人',
    value: 10,
    popovers: [
      {
        title: '如何配置表单内联系人？',
        content: '在表单设计中添加联系人控件后，该人员/其上级/部门负责人将可以配置为本节点的审批人。',
      },
    ],
  },
  {
    name: '表单内部门',
    value: 11,
    popovers: [
      {
        title: '何配置表单内部门？',
        content: '在表单设计中添加部门控件后，其部门负责人可以配置为本节点的审批人。',
      },
    ],
  },
]);
const flowDesign = useFlowDesign(piniaInstance);
const afterVisibleChange = (val) => {
  console.log('visible', val);
}
const showDrawer = (snode) => {
  visible.value = true;
  node.value = snode;
}
const onClose = () => {
  visible.value = false;
  emits('close');
}
/**
 * 保存配置
 */
const onSave = () => {
  // 更新节点显示信息
  let content = '';
  node.value.approverGroups.forEach((group) => {
    if (group.approverNames.length > 0) {
      content += group.approverNames.join(',');
    }
    if (content) {
      content += ',';
    }
  });
  if (!content && node.value.customCc) {
    //  是否设置发起人填写
    content += '发起人填写';
  }
  if (content) {
    flowDesign.flowUpdateNode({currNode: node.value, field: 'content', value: content});
    flowDesign.flowUpdateNode({currNode: node.value, field: 'error', value: false});
  } else {
    flowDesign.flowUpdateNode({currNode: node.value, field: 'content', value: null});
    flowDesign.flowUpdateNode({currNode: node.value, field: 'error', value: true});
  }
  onClose();
}
defineExpose({
  showDrawer
})
</script>
