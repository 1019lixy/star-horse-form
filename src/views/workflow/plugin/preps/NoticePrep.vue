<template>
  <el-form :model="node" label-position="top">
    <el-tabs v-model="noticeTab">
      <el-tab-pane key="1" name="1" label="通知设置">
        <el-form-item label="通知类型" prop="noticeType">
          <el-checkbox-group v-model="noticeType">
            <el-row :gutter="24">
              <el-col :span="8" v-for="(notice, i) in notices" :key="i">
                <el-checkbox :value="notice.value">{{ notice.name }}</el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="发送通知人" prop="noticeUser">
          <FlowNodeApproval :groups="node.approveGroups" :node="node" title="通知人"/>
        </el-form-item>
        <el-form-item label="外部手机号" v-if="noticeType.includes('shortMsg')">
          <el-button link icon="plus" block>
            添加手机号
          </el-button>
        </el-form-item>
        <el-form-item label="外部邮箱账号" v-if="noticeType.includes('email')">
          <el-button link icon="plus" block>
            添加邮箱
          </el-button>
        </el-form-item>
        <el-form-item label="外部邮箱账号" v-if="noticeType.includes('email')">
          <el-checkbox-group v-model="emailExt">
            <el-row :gutter="12">
              <el-col :span="12" v-for="(item, i) in emailItems" :key="i">
                <el-checkbox :value="item.value">{{ item.name }}</el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="抄送人" v-if="noticeType.includes('email') && emailExt.includes(1)">
          <FlowNodeApproval :groups="node.approveGroups" :node="node" title="抄送人"/>
        </el-form-item>
        <el-form-item label="密送人" v-if="noticeType.includes('email') && emailExt.includes(2)">
          <FlowNodeApproval :groups="node.approveGroups" :node="node" title="密送人"/>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane key="2" name="2" label="内容设置">
        <el-form-item label="选择已审核模板" prop="contentTemplate">
          <div style="display: flex;width: 100%; flex-direction: column;align-items: start !important;">
            <star-horse-data-selector model-value="node.contentTemplate"
                                      data-url="/message-manage/messageTemplate/pageList"
                                      display-name="templateName"
                                      display-value="idMessageTemplate"
                                      placeholder="请选择模板"
                                      :page-size="100"/>
            <el-button link icon="plus" @click.stop="newTemplate" style="margin-top: 10px">
              创建新模板
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="主题">
          <el-input v-model="node.noticeTitle" :size="flowCommon.size" :rows="4" placeholder="主题"/>
        </el-form-item>
        <el-form-item label="通知内容">
          <el-input type="textarea" v-model="node.noticeContext" :size="flowCommon.size" :rows="4"
                    placeholder="通知内容"/>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane key="3" name="3" label="高级设置"></el-tab-pane>
    </el-tabs>
  </el-form>
  <FlowDrawerFooter @close="onClose"/>
</template>
<script setup lang="ts">
import {flowCommon} from '@/views/workflow/plugin/utils/flowCommon.ts';
import FlowNodeApproval from '@/views/workflow/plugin/preps/utils/Approval.vue';
import FlowDrawerFooter from '@/views/workflow/plugin/common/DrawerFooter.vue';
import {onMounted, ref} from "vue";
import {dictData} from "@/api/sh_api.ts";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {ModelRef} from "vue-demi";
import StarHorseDataSelector from "@/components/comp/StarHorseDataSelector.vue";

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
const newTemplate = () => {

}
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
<style lang="scss" scoped>
:deep(.el-form-item__label) {
  font-weight: 800;
}
</style>
