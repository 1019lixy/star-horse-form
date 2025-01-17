<template>
  <el-drawer v-model="drawer" title="添加数据" @close="closeAction">
    <star-horse-form-list :fieldList="fieldList" v-model:dataForm="extendForm" :batch-name="currentName"/>
  </el-drawer>
  <el-form :model="node" label-position="top">
    <el-tabs v-model="noticeTab">
      <el-tab-pane key="1" name="1" label="通知设置">
        <el-form-item label="通知类型" prop="noticeType">
          <el-checkbox-group v-model="node.noticeType">
            <el-row :gutter="24">
              <el-col :span="8" v-for="(notice, i) in notices" :key="i">
                <el-checkbox :value="notice.value">{{ notice.name }}</el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="发送通知人" prop="approveGroups">
          <FlowNodeApproval :groups="node.approveGroups" :node="node" title="通知人"/>
        </el-form-item>
        <el-form-item label="秘送通知人" prop="secretApproveGroups">
          <FlowNodeApproval :groups="node.secretApproveGroups" :node="node" title="秘送通知人"/>
        </el-form-item>
        <el-form-item label="外部手机号" prop="extendPhones" v-if="node.noticeType.includes('shortMsg')">
          <el-badge :value="node.extendPhones?.length || 0" class="item" type="primary">
            <el-button :size="flowCommon.size" icon="Setting" @click="addExtendData('phone')"> 添加手机号</el-button>
          </el-badge>

        </el-form-item>
        <el-form-item label="外部邮箱账号" prop="extendEmails" v-if="node.noticeType.includes('email')">
          <el-badge :value="node.extendEmails?.length || 0" class="item" type="primary">
            <el-button :size="flowCommon.size" icon="Setting" @click="addExtendData('email')">
              添加邮箱
            </el-button>
          </el-badge>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane key="2" name="2" label="内容设置">
        <el-form-item label="选择已审核模板" prop="contentTemplate">
          <div style="display: flex;width: 100%; flex-direction: column;align-items: start !important;">
            <star-horse-data-selector v-model="node.contentTemplate"
                                      data-url="/message-manage/messageTemplate/pageList"
                                      display-name="templateName"
                                      display-value="idMessageTemplate"
                                      placeholder="请选择模板"
                                      :page-size="100"/>
            <el-button :size="flowCommon.size" icon="plus" @click.stop="newTemplate" style="margin-top: 10px">
              创建新模板
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="主题">
          <el-input v-model="node.subject" :size="flowCommon.size" :rows="4" placeholder="主题"/>
        </el-form-item>
        <el-form-item label="通知内容">
          <el-input type="textarea" v-model="node.content" :size="flowCommon.size" :rows="4"
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
import StarHorseFormList from "@/components/comp/StarHorseFormList.vue";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {getValidType} from "@/api/valid_utils.ts";
import {warning} from "@/utils/message.ts";

defineOptions({
  name: 'NoticePrep',
})

let node: ModelRef<any> = defineModel("activeData");

const flowDesign = useFlowDesign(piniaInstance);
let noticeTab = ref<string>('1');
// 邮件选择项
let fieldList = ref<Array<FieldInfo>>([]);
let notices = ref<Array<any>>([]);

const newTemplate = () => {
  warning("加急开发中");
}
let currentExtend = ref<Array<any>>([]);
let drawer = ref<boolean>(false);
let currentName = ref<string>("");
let extendForm = ref<any>({});

const closeAction = () => {
  drawer.value = false;
  node.value[currentName.value] = extendForm.value[currentName.value].map((item: any) => item.email || item.phone);
  console.log(node.value);
}
const addExtendData = (type: string) => {
  extendForm.value = {};
  if (type == "phone") {
    fieldList.value = [
      {label: '手机号', fieldName: 'phone', type: 'input', required: true, rules: getValidType("phone"), formVisible: true},
    ];
    node.value.extendPhones = node.value.extendPhones || [];
    currentExtend.value = node.value.extendPhones;
    currentName.value = "extendPhones";
    extendForm.value[currentName.value] = node.value.extendPhones.map((item: any) => {
      return {phone: item};
    });
  } else {
    fieldList.value = [
      {label: '邮箱号', fieldName: 'email', type: 'input', required: true, rules: getValidType("email"), formVisible: true},
    ];
    node.value.extendEmails = node.value.extendEmails || [];
    currentExtend.value = node.value.extendEmails;
    currentName.value = "extendEmails";
    extendForm.value[currentName.value] = node.value.extendEmails.map((item: any) => {
      return {email: item};
    });
  }


  drawer.value = true;
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
