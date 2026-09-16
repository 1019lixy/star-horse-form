<script setup lang="ts">
/**
 * 流程设计扩展按钮（自包含：按钮 + 可视化流程设计器弹窗）。
 *
 * 放入设计器 #toolbar-extra 插槽即启用在线流程设计：
 * 设计结果写入 formInfo.flowConfigures（mode=design）随表单保存。
 */
import {ref, unref} from "vue";
import {success, warning} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {getDesignFormStore} from "@/store/StoreManager";
import FlowDesigner from "@/components/workflow/designer/FlowDesigner.vue";
import {validateAllNodes} from "@/components/workflow/validator";
import ExtToolbarButton from "@/components/system/items/form/extensions/ExtToolbarButton.vue";

defineOptions({name: "FlowDesignButton"});

const designForm = getDesignFormStore();
const flowDesignDialogVisible = ref(false);
const flowDesignerRef = ref();
const flowDesigned = ref(false);

/** 保存在线流程设计结果到 formInfo.flowConfigures */
const saveFlowDesign = () => {
  const node = unref(flowDesignerRef.value?.nodeData);
  if (!node || !node.childNode) {
    warning(i18n("dyform.step.flowDesignEmpty"));
    return;
  }
  const errors = validateAllNodes(node);
  if (errors.length > 0) {
    warning(errors.map((e) => `[${e.nodeName}] ${e.errors.join("；")}`).join("\n"));
    return;
  }
  designForm.formInfo.flowConfigures = {
    mode: "design",
    process: JSON.parse(JSON.stringify(node)),
  };
  designForm.formInfo.flowFlag = "Y";
  designForm.formInfo.flowBindMode = "design";
  flowDesigned.value = true;
  flowDesignDialogVisible.value = false;
  success(i18n("dyform.step.flowDesignStatus.done"));
};
</script>

<template>
  <ExtToolbarButton
      icon="flow"
      :label="flowDesigned
        ? i18n('dyform.step.flowDesignerTitle.reedit')
        : i18n('dyform.toolbar.flowDesign')"
      @click="flowDesignDialogVisible = true"
  />
  <star-horse-panel
      v-model="flowDesignDialogVisible"
      :title="flowDesigned
        ? i18n('dyform.step.flowDesignerTitle.reedit')
        : i18n('dyform.step.flowDesignerTitle')"
      :userAction="true"
      :fullScreen="true"
      @closeAction="flowDesignDialogVisible = false"
      @merge="saveFlowDesign"
  >
    <FlowDesigner
        ref="flowDesignerRef"
        :stopInitFormInfo="true"
        :saveBtnVisible="false"
        :mapBtnVisible="false"
        :initialNode="designForm.formInfo?.flowConfigures?.process || {}"
    />
  </star-horse-panel>
</template>
