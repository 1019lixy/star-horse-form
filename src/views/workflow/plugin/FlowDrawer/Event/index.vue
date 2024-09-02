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
    <template slot="title">
      <img :src="flowMixin.webhookIcon2" class="anticon"/>
      <span class="flow-ant-drawer-title">
        <EditName v-model="node.name"/>
      </span>
    </template>
    <div class="flow-setting-module">
      <div class="flow-setting-content">
        <el-form>
          <div class="flow-setting-item">
            <p class="flow-setting-item-title">节点名称</p>
            <el-form-item name="name">
              <el-input v-model="node.name" :size="flowMixin.size" class="w-full" placeholder="节点名称"/>
            </el-form-item>
          </div>
          <div class="flow-setting-item">
            <p class="flow-setting-item-title">事件类型</p>
            <div class="flow-setting-option">
              <div class="flow-setting-option-item">
                <div class="flow-setting-option-item-left">
                  <img :src="flowMixin.optionIcon"/>
                  <div class="flow-setting-option-desc">
                    <p class="setting-option-title">前置事件</p>
                    <p class="setting-option-desc">用于节点前,常用于数据校验</p>
                  </div>
                </div>
                <div class="flow-setting-option-item-switch">
                  <el-switch checked-children="开" un-checked-children="关"/>
                </div>
              </div>
            </div>
            <div class="flow-setting-option">
              <div class="flow-setting-option-item">
                <div class="flow-setting-option-item-left">
                  <img :src="flowMixin.optionIcon"/>
                  <div class="flow-setting-option-desc">
                    <p class="setting-option-title">后置事件</p>
                    <p class="setting-option-desc">用于节点后,常用于数据落地保存</p>
                  </div>
                </div>
                <div class="flow-setting-option-item-switch">
                  <el-switch checked-children="开" un-checked-children="关"/>
                </div>
              </div>
            </div>
            <div class="flow-setting-option">
              <div class="flow-setting-option-item">
                <div class="flow-setting-option-item-left">
                  <img :src="flowMixin.optionIcon"/>
                  <div class="flow-setting-option-desc">
                    <p class="setting-option-title">WebHook</p>
                    <p class="setting-option-desc">远程API调用</p>
                  </div>
                </div>
                <div class="flow-setting-option-item-switch">
                  <el-switch checked-children="开" un-checked-children="关"/>
                </div>
              </div>
            </div>
          </div>
          <div class="flow-setting-item">
            <p class="flow-setting-item-title">前置事件配置</p>
          </div>
          <div class="flow-setting-item">
            <p class="flow-setting-item-title">后置事件配置</p>
            <!-- <el-textarea v-model="noticeContext" :size="size" class="w-full" placeholder="通知内容" /> -->
          </div>
          <div class="flow-setting-item">
            <p class="flow-setting-item-title">WebHook配置</p>
            <!-- <el-textarea v-model="noticeContext" :size="size" class="w-full" placeholder="通知内容" /> -->
          </div>
        </el-form>
      </div>
    </div>
    <FlowDrawerFooter @close="onClose"/>
  </el-drawer>
</template>
<script setup lang="ts">
import {flowMixin} from '@/views/workflow/plugin/mixins/flowMixin';
import EditName from '@/views/workflow/plugin/Common/EditName.vue';
import FlowDrawerFooter from '@/views/workflow/plugin/Common/DrawerFooter.vue';
import {ref} from "vue";
import {scale} from "@/views/workflow/plugin/util/deviceUtil";

const emits = defineEmits(["close"]);
let node = ref<any>({});
let visible = ref<boolean>(false);
let headerStyle = ref<any>({
  'background-color': '#ff4056',
  'border-radius': '0px 0px 0 0',
});
let noticeContext = ref<string>('');
let noticeType = ref<Array<any>>([]);
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
