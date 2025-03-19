<script setup lang="ts">
  import { ref, computed } from "vue";
  import FlowDrawerFooter from "@/views/workflow/plugin/common/DrawerFooter.vue";
  import AuthForm from "@/views/workflow/plugin/common/AuthForm.vue";
  import FlowNodeApproval from "@/views/workflow/plugin/preps/utils/Approval.vue";
  import FlowNodeCopyerConfigure from "@/views/workflow/plugin/preps/utils/CopyerConfigure.vue";
  import { useFlowDesignStore } from "@/store/FlowDesign.ts";
  import piniaInstance from "@/store";
  import { ModelRef } from "vue-demi";

  defineOptions({
    name: "CopyerPrep"
  });
  let node: ModelRef<any> = defineModel("activeData");
  let copyerTab = ref<string>("1");

  const flowDesign = useFlowDesignStore(piniaInstance);
  const flowFormInfo = computed(() => flowDesign.flowFormInfo);
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
    <el-tabs v-model="copyerTab">
      <el-tab-pane key="1" name="1" label="抄送设置">
        <el-form-item label="抄送人" prop="approveGroups">
          <FlowNodeApproval :groups="node.approveGroups" :node="node" title="抄送人" />
        </el-form-item>
        <el-form-item label="密送人" prop="secretApproveGroups">
          <FlowNodeApproval :groups="node.secretApproveGroups" :node="node" title="密送人" />
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane key="2" name="2" label="表单权限">
        <el-form-item label="表单权限" prop="privilege">
          <AuthForm v-model="node.privilege" :form-id="flowFormInfo?.formId" />
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane key="3" name="3" label="高级设置">
        <FlowNodeCopyerConfigure v-model="node.operations" />
      </el-tab-pane>
    </el-tabs>
  </el-form>
  <FlowDrawerFooter @close="onClose" @save="onSave" />
</template>
<style lang="scss" scoped>
  :deep(.el-form-item__label) {
    font-weight: 800;
  }
</style>
