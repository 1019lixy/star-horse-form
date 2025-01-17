<template>
  <div class="flow-module">
    <div class="flow-content">
      <div class="flow-item">
        <el-tabs v-model="activeTab" type="border-card" stretch>
          <el-tab-pane label="基础设置" name="basic">
            <ExecutionListeners :node="node"/>
          </el-tab-pane>
          <el-tab-pane label="表单权限" name="form">
            <star-horse-data-selector data-url="/userdb-manage/userdb/dynamicForm/pageList"
                                      display-name="formName"
                                      display-value="idDynamicForm"
                                      :pageSize="100"
                                      placeholder="请选择表单"
                                      v-model="node.formId"/>
            <AuthForm v-model="node.privilege" :formId="node.formId" writable/>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
  <FlowDrawerFooter @close="onClose" @save="onSave"/>
</template>
<script setup lang="ts">
import {computed, defineModel, defineOptions, ref} from "vue";
import FlowDrawerFooter from '@/views/workflow/plugin/common/DrawerFooter.vue';
import AuthForm from '@/views/workflow/plugin/common/AuthForm.vue';
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {ModelRef} from "vue-demi";
import ExecutionListeners from "@/views/workflow/plugin/preps/utils/ExecutionListeners.vue";
import StarHorseDataSelector from "@/components/comp/StarHorseDataSelector.vue";

defineOptions({
  name: 'ApplyPrep',
})
let activeTab = ref<string>('basic');
let node: ModelRef<any> = defineModel("activeData");
const flowDesign = useFlowDesign(piniaInstance);
const flowFormInfo = computed(() => flowDesign.flowFormInfo);
node.value.content = computed(() => {
  let privilege = node.value.privilege;
  return privilege == "edit" ? "可编辑" : privilege == "readonly" ? "只读" : "禁止查看";
})
const onClose = () => {
  flowDesign.setActive(false);
}
/**
 * 保存配置
 */
const onSave = () => {
  //记录表单的ID
  flowFormInfo.value["formId"] = node.value.formId;
  onClose();
}
</script>
