<script setup lang="ts">
import {dlog, dwarn, derror, dinfo} from "@/utils/debugLog";
import { computed, ModelRef, ref } from "vue";
import { useFlowDesignStore } from "@/store/FlowDesign";
import { piniaInstance } from "star-horse-lowcode";
import BasePrep from "@/components/workflow/designer/preps/BasePrep.vue";
import Approval from "@/components/workflow/designer/preps/utils/Approval.vue";

defineOptions({
  name: "CopyerPrep",
});
let node: ModelRef<any> = defineModel("activeData");
let copyerTab = ref<string>("basic");

// 老节点兜底：历史抄送节点 JSON 无 ccEnabled/ccVisibleType，缺省按新默认（启用+全程通知）初始化
if (node.value && node.value.ccEnabled === undefined) {
  node.value.ccEnabled = true;
}
if (node.value && !node.value.ccVisibleType) {
  node.value.ccVisibleType = "full";
}

const flowDesign = useFlowDesignStore(piniaInstance);
const flowFormInfo = computed(() => flowDesign.flowFormInfo);
const formId = computed(() => flowDesign.getFormId());
const onClose = () => {
  flowDesign.setActive(false);
};
/**
 * 保存配置
 */
const onSave = () => {
  // 更新节点显示信息
  let content = "";
  node.value.approveGroups.forEach((group: any) => {
    content += group.currentApproveType?.approvalType;
    if (content) {
      content += ",";
    }
  });
  if (!content && node.value.operations?.customCc) {
    //  是否设置发起人填写
    content += "发起人填写";
  }
  dlog(node.value);
  node.value.content = content;
  onClose();
};
</script>
<template>
  <el-form v-model="node" label-position="top">
    <el-tabs v-model="copyerTab" type="border-card">
      <el-tab-pane key="basic" name="basic" label="节点信息">
        <BasePrep :nodeInfo="node" />
      </el-tab-pane>
      <el-tab-pane key="copy" name="copy" label="抄送设置">
        <el-form-item label="抄送人" prop="approveGroups">
          <Approval
            :groups="node.approveGroups"
            :node="node"
            title="抄送人"
            :multiple="true"
          />
        </el-form-item>
        <el-form-item label="密送人" prop="secretApproveGroups">
          <Approval
            :multiple="true"
            :groups="node.secretApproveGroups"
            :node="node"
            title="密送人"
          />
        </el-form-item>
        <el-form-item label="启用抄送通知" prop="ccEnabled">
          <el-switch
            v-model="node.ccEnabled"
            active-text="开"
            inactive-text="关"
          />
          <span class="cc-tip">开启后抄送人将收到通知消息</span>
        </el-form-item>
        <el-form-item v-if="node.ccEnabled" label="通知时机" prop="ccVisibleType">
          <el-select v-model="node.ccVisibleType" style="width: 100%">
            <el-option label="全程通知（流程启动/审批结束等）" value="full" />
            <el-option label="仅节点执行时" value="node" />
          </el-select>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane key="authority" name="authority" label="表单权限">
        <el-form-item label="表单权限" prop="privilege">
          <AuthForm v-model="node.privilege" :form-id="formId" />
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane key="advanced" name="advanced" label="高级设置">
        <CopyerConfigure v-model="node.operations" />
      </el-tab-pane>
    </el-tabs>
  </el-form>
  <DrawerFooter @close="onClose" @save="onSave" />
</template>
<style lang="scss" scoped>
:deep(.el-form-item__label) {
  font-weight: 800;
}
.cc-tip {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
