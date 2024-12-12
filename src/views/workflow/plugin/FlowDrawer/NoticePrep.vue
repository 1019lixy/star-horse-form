<template>
  <el-drawer
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
        <img :src="flowMixin.noticeIcon" class="anticon"/>
        <span class="flow-drawer-title">
        <EditName v-model:nodeName="node.name"/>
      </span>
      </div>
    </template>
    <div class="flow-setting-module">
      <el-tabs v-model="noticeTab">
        <el-tab-pane key="1" name="1" label="通知设置">
          <div class="flow-setting-content">
            <div class="flow-setting-item">
              <p class="flow-setting-item-title">节点名称</p>
              <el-input v-model="node.name" :size="flowMixin.size" class="w-full" placeholder="节点名称"/>
            </div>
            <div class="flow-setting-item">
              <p class="flow-setting-item-title">通知类型</p>
              <el-checkbox-group v-model="noticeType">
                <el-row :gutter="24">
                  <el-col :span="8" v-for="(notice, i) in notices" :key="i">
                    <el-checkbox :value="notice.value">{{ notice.name }}</el-checkbox>
                  </el-col>
                </el-row>
              </el-checkbox-group>
            </div>
            <div class="flow-setting-item">
              <p class="flow-setting-item-title">发送通知人</p>
              <FlowNodeApproval :groups="node.approverGroups" :node="node" title="通知人"/>
            </div>
            <div v-if="noticeType.includes(2)" class="flow-setting-item">
              <p class="flow-setting-item-title">外部手机号</p>
              <el-button link icon="plus" block>
                添加手机号
              </el-button>
            </div>
            <div v-if="noticeType.includes(3)" class="flow-setting-item">
              <p class="flow-setting-item-title">外部邮箱账号</p>
              <el-button link icon="plus" block>
                添加邮箱
              </el-button>
            </div>
            <div v-if="noticeType.includes(3)" class="flow-setting-item">
              <el-checkbox-group v-model="emailExt">
                <el-row :gutter="12">
                  <el-col :span="12" v-for="(item, i) in emailItems" :key="i">
                    <el-checkbox :value="item.value">{{ item.name }}</el-checkbox>
                  </el-col>
                </el-row>
              </el-checkbox-group>
            </div>
            <div v-if="noticeType.includes(3) && emailExt.includes(1)" class="flow-setting-item">
              <p class="flow-setting-item-title">抄送人</p>
              <FlowNodeApproval :groups="node.approverGroups" :node="node" title="抄送人"/>
            </div>
            <div v-if="noticeType.includes(3) && emailExt.includes(2)" class="flow-setting-item">
              <p class="flow-setting-item-title">密送人</p>
              <FlowNodeApproval :groups="node.approverGroups" :node="node" title="密送人"/>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane key="2" name="2" label="内容设置">
          <div class="flow-setting-content">
            <div class="flow-setting-item">
              <p class="flow-setting-item-title">选择已审核模板</p>
              <div class="tpl-flex-box">
                <el-button link icon="plus">
                  创建新模板
                </el-button>
              </div>
              <el-select :size="flowMixin.size" v-model="node.contentTemplate" style="width: 100%;margin-bottom: 20px;"
                         placeholder="请选择模板"></el-select>
            </div>
            <div class="flow-setting-item">
              <p class="flow-setting-item-title">主题</p>
              <el-input v-model="node.noticeTitle" :size="flowMixin.size" :rows="4" placeholder="主题"/>
            </div>
            <div class="flow-setting-item">
              <p class="flow-setting-item-title">通知内容</p>
              <el-input type="textarea" v-model="node.noticeContext" :size="flowMixin.size" :rows="4"
                        placeholder="通知内容"/>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane key="3" name="3" label="高级设置"></el-tab-pane>
      </el-tabs>
    </div>
    <FlowDrawerFooter @close="onClose"/>
  </el-drawer>
</template>
<script setup lang="ts" name="Notice">
import {flowMixin} from '@/views/workflow/plugin/mixins/flowMixin.ts';
import EditName from '@/views/workflow/plugin/Common/EditName.vue';
import FlowNodeApproval from './Approver/Approval.vue';
import FlowDrawerFooter from '@/views/workflow/plugin/Common/DrawerFooter.vue';
import {scale} from "@/views/workflow/plugin/util/deviceUtil.ts";
import {ref} from "vue";

const emits = defineEmits(["close"]);
let node = ref<any>({});
let visible = ref<boolean>(false);
let headerStyle = ref<any>({
  'background-color': '#498ff2',
  'border-radius': '0px 0px 0 0',
});
let noticeTitle = ref<string>("");
let noticeContext = ref<string>('');
let noticeTab = ref<string>('1');
let noticeType = ref<Array<any>>([]);
// 邮件选择项
let emailExt = ref<Array<any>>([]);
let notices = ref<Array<any>>([
  {
    name: '站内通信',
    value: 1,
  },
  {
    name: '短信通知',
    value: 2,
  },
  {
    name: '邮件通知',
    value: 3,
  },
  {
    name: '钉钉通知',
    value: 4,
  },
  {
    name: '企业微信',
    value: 5,
  },
  {
    name: 'WeLink',
    value: 6,
  },
]);
let emailItems = ref<Array<any>>([
  {
    name: '添加抄送',
    value: 1,
  },
  {
    name: '添加密送',
    value: 2,
  },
]);
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
defineExpose({
  showDrawer
})
</script>
