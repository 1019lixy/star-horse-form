<script setup lang="ts">
import {useFlowDesignStore} from "@/store/FlowDesign";
import {piniaInstance} from "star-horse-lowcode";
import {computed, ModelRef, onMounted, ref} from "vue";
import BasePrep from "@/views/workflow/plugin/preps/BasePrep.vue";
import {serviceFieldsInfo, serviceTaskTypeList} from "@/views/jbpm/panel/Fields.js";

defineOptions({
  name: "ServicePrep",
});
let node: ModelRef<any> = defineModel("activeData");
const formRef = ref();
const flowDesign = useFlowDesignStore(piniaInstance);
const approvalTab = ref("basic");
const serviceField = computed(() => {
  return serviceFieldsInfo(node.value.serviceType);
});
const init = () => {
  if (!node.value.params) {
    node.value.params = {};
  }
  if (!node.value.serviceType) {
    // serviceTypeChange("task");
    node.value.serviceType = "task";
  }

};
onMounted(() => {
  init();
});
// const serviceTypeChange = (type: string) => {
//   serviceField.value = serviceFieldsInfo(type);
// };
const onClose = () => {
  flowDesign.setActive(false);
};
/**
 * 保存配置
 */
const onSave = async () => {
  let result = await formRef.value.validate();
  if (!result) {
    return;
  }
  // 更新节点显示信息
  node.value.content = node.value.implementationType || "";
  onClose();
};
</script>
<template>
  <ShForm :model="node" label-position="top" ref="formRef">
    <el-tabs
        type="border-card"
        v-model="approvalTab"
    >
      <el-tab-pane key="basic" name="basic" label="节点信息">
        <BasePrep :nodeInfo="node"/>
      </el-tab-pane>
      <el-tab-pane key="serviceType" name="serviceTaskType" label="服务类别配置">
        <el-divider content-position="left">节点类别</el-divider>
        <el-radio-group v-model="node.serviceType">
          <el-radio v-for="item in serviceTaskTypeList"
                    :label="item.name"
                    :value="item.value"/>
        </el-radio-group>
        <el-divider content-position="left">
          {{ serviceTaskTypeList.find(item => item.value == node.serviceType)?.name ?? node.serviceType }}配置
        </el-divider>
        <el-scrollbar height="100%">
          <star-horse-form-item ref="basePrepRef"
                                :fieldList="serviceField"
                                :dataIndex="0"
                                compSize="default"
                                batchName="params"
                                propPrefix="params"
                                subFormFlag="Y"
                                v-model:dataForm="node['params']"/>
        </el-scrollbar>
      </el-tab-pane>
      <!--      <el-tab-pane label="服务配置" name="service">
              <execution-listeners :node="node"/>
            </el-tab-pane>-->
    </el-tabs>
  </ShForm>
  <DrawerFooter @close="onClose" @save="onSave"/>
</template>
<style scoped></style>
