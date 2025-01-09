<template>
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
            <FlowNodeApproval :groups="node.approveGroups" :node="node" title="通知人"/>
          </div>
          <div v-if="noticeType.includes('shortMsg')" class="flow-setting-item">
            <p class="flow-setting-item-title">外部手机号</p>
            <el-button link icon="plus" block>
              添加手机号
            </el-button>
          </div>
          <div v-if="noticeType.includes('email')" class="flow-setting-item">
            <p class="flow-setting-item-title">外部邮箱账号</p>
            <el-button link icon="plus" block>
              添加邮箱
            </el-button>
          </div>
          <div v-if="noticeType.includes('email')" class="flow-setting-item">
            <el-checkbox-group v-model="emailExt">
              <el-row :gutter="12">
                <el-col :span="12" v-for="(item, i) in emailItems" :key="i">
                  <el-checkbox :value="item.value">{{ item.name }}</el-checkbox>
                </el-col>
              </el-row>
            </el-checkbox-group>
          </div>
          <div v-if="noticeType.includes('email') && emailExt.includes(1)" class="flow-setting-item">
            <p class="flow-setting-item-title">抄送人</p>
            <FlowNodeApproval :groups="node.approveGroups" :node="node" title="抄送人"/>
          </div>
          <div v-if="noticeType.includes('email') && emailExt.includes(2)" class="flow-setting-item">
            <p class="flow-setting-item-title">密送人</p>
            <FlowNodeApproval :groups="node.approveGroups" :node="node" title="密送人"/>
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
</template>
<script setup lang="ts">
import {flowMixin} from '@/views/workflow/plugin/mixins/flowMixin.ts';
import FlowNodeApproval from '@/views/workflow/plugin/FlowDrawer/utils/Approval.vue';
import FlowDrawerFooter from '@/views/workflow/plugin/common/DrawerFooter.vue';
import {onMounted, ref} from "vue";
import {dictData} from "@/api/sh_api.ts";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {ModelRef} from "vue-demi";

defineOptions({
  name: 'NoticePrep',
})

let node: ModelRef<any> = defineModel("activeData");

const flowDesign = useFlowDesign(piniaInstance);
let noticeTab = ref<string>('1');
let noticeType = ref<Array<any>>([]);
// 邮件选择项
let emailExt = ref<Array<any>>([]);
let notices = ref<Array<any>>([]);
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
const onClose = () => {
  flowDesign.setActive(false);
}
const init = async () => {
  notices.value = await dictData("message_tools");
}
onMounted(() => {
  init();
})

</script>
