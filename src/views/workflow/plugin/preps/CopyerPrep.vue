<script setup lang="ts">
import {computed, ModelRef, ref} from "vue";
import {useFlowDesignStore} from "@/store/FlowDesign";
import {piniaInstance} from "star-horse-lowcode";
import BasePrep from "@/views/workflow/plugin/preps/BasePrep.vue";
import Approval from "@/views/workflow/plugin/preps/utils/Approval.vue";

defineOptions({
  name: "CopyerPrep",
});
let node: ModelRef<any> = defineModel("activeData");
let copyerTab = ref<string>("basic");

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
    if (Array.isArray(group.approverNames) && group.approverNames.length > 0) {
      content += group.approverNames.join(",");
    } else {
      content += group.approverNames;
    }
    if (content) {
      content += ",";
    }
  });
  if (!content && node.value.operations?.customCc) {
    //  是否设置发起人填写
    content += "发起人填写";
  }
  onClose();
};
</script>
<template>
  <el-form v-model="node" label-position="top">
    <el-tabs v-model="copyerTab" type="border-card">
      <el-tab-pane key="basic" name="basic" label="节点信息">
        <BasePrep :nodeInfo="node"/>
      </el-tab-pane>
      <el-tab-pane key="copy" name="copy" label="抄送设置">
        <el-form-item label="抄送人" prop="approveGroups">
          <Approval :groups="node.approveGroups" :node="node" title="抄送人" :multiple="true"/>
        </el-form-item>
        <el-form-item label="密送人" prop="secretApproveGroups">
          <Approval
              :multiple="true"
              :groups="node.secretApproveGroups"
              :node="node"
              title="密送人"
          />
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane key="authority" name="authority" label="表单权限">
        <el-form-item
            label="表单权限"
            prop="privilege"
        >
          <AuthForm
              v-model="node.privilege"
              :form-id="formId"
          />
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane key="advanced" name="advanced" label="高级设置">
        <CopyerConfigure v-model="node.operations"/>
      </el-tab-pane>
    </el-tabs>
  </el-form>
  <DrawerFooter @close="onClose" @save="onSave"/>
</template>
<style lang="scss" scoped>
:deep(.el-form-item__label) {
  font-weight: 800;
}
</style>
