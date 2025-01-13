<template>
  <div class="flow-setting-module">
    <div class="flow-setting-content">
      <div class="flow-setting-item">
        <el-tabs v-model="activeTab" type="border-card" stretch>
          <el-tab-pane label="基础设置" name="basic">
            <ExecutionListeners :node="node"/>
          </el-tab-pane>
          <el-tab-pane label="表单权限" name="form">
            <star-horse-data-selector data-url="/userdb-manage/userdb/dynamicForm/pageList"
                                      display-name="formName"
                                      display-value="idDynamicForm"
                                      page-size=100
                                      v-model="value"/>
            <AuthForm v-model="node.privileges" :formId="value" writable/>
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
import DialogInputItem from "@/components/formcomp/items/dialog-input-item.vue";
import StarHorseDataSelector from "@/components/comp/StarHorseDataSelector.vue";

defineOptions({
  name: 'WritePrep',
})
let activeTab = ref<string>('basic');
let node: ModelRef<any> = defineModel("activeData");
let value = ref<string>('');
const flowDesign = useFlowDesign(piniaInstance);
const flowFormInfo = computed(() => flowDesign.flowFormInfo);
const onClose = () => {
  flowDesign.setActive(false);
}
/**
 * 保存配置
 */
const onSave = () => {
  // 更新节点显示信息
  if (node.value.privileges && node.value.privileges.length > 0) {
    flowDesign.flowUpdateNode({currNode: node.value, field: 'content', value: '已设置'});
    flowDesign.flowUpdateNode({currNode: node.value, field: 'error', value: false});
    onClose();
  } else {
    flowDesign.flowUpdateNode({currNode: node.value, field: 'content', value: null});
    flowDesign.flowUpdateNode({currNode: node.value, field: 'error', value: false});
  }
}
</script>
