<script setup lang="ts">
import {useFlowDesignStore} from "@/store/FlowDesign";
import {piniaInstance} from "star-horse-lowcode";
import {ModelRef, nextTick, onActivated, onMounted, ref} from "vue";
import BasePrep from "@/views/workflow/plugin/preps/BasePrep.vue";
import {serviceFieldsInfo, serviceTaskTypeList,} from "@/views/jbpm/panel/Fields.js";

defineOptions({
  name: "ServicePrep",
});
let node: ModelRef<any> = defineModel("activeData");
const formRef = ref();
const flowDesign = useFlowDesignStore(piniaInstance);
const approvalTab = ref("basic");

const serviceField = ref<any>({});
const init = () => {
  if (!node.value.params) {
    node.value.params = {};
  }
  if (!node.value.serviceType) {
    typeChange("task");

  }
};
onMounted(() => {
  init();
});
onActivated(() => {
  init();
});
const typeChange = (type: string) => {
  node.value.serviceType = type;
  serviceField.value = {};
  nextTick(() => {
    serviceField.value = serviceFieldsInfo(type);
  });
};
const tabChange = () => {
  if (approvalTab.value == "serviceTaskType") {
    typeChange(node.value.serviceType ?? "task");
  }
};
const onClose = () => {
  flowDesign.setActive(false);
  serviceField.value = {};
  approvalTab.value = "basic";
};
/**
 * 保存配置
 */
const onSave = async () => {
  let result = await formRef.value.validate();
  if (!result) {
    return;
  }
  node.value.content=serviceTaskTypeList.value.find((item) => item.value == node.value.serviceType)
      ?.name ?? node.value.serviceType;
  // 更新节点显示信息
  onClose();
};
</script>
<template>
  <ShForm :model="node" label-position="top" ref="formRef">
    <el-tabs type="border-card" v-model="approvalTab" @tab-change="tabChange">
      <el-tab-pane key="basic" name="basic" label="节点信息">
        <BasePrep :nodeInfo="node"/>
      </el-tab-pane>
      <el-tab-pane
          key="serviceType"
          name="serviceTaskType"
          label="服务类别配置"
      >
        <el-divider content-position="left">节点类别</el-divider>
        <el-radio-group v-model="node.serviceType" @change="typeChange">
          <el-radio
              v-for="item in serviceTaskTypeList"
              :label="item.name"
              :value="item.value"
          />
        </el-radio-group>
        <el-divider content-position="left">
          {{
            serviceTaskTypeList.find((item) => item.value == node.serviceType)
                ?.name ?? node.serviceType
          }}配置
        </el-divider>
        <el-scrollbar height="100%">
          <star-horse-form-item
              ref="basePrepRef"
              :fieldList="serviceField"
              :dataIndex="0"
              compSize="default"
              batchName="params"
              propPrefix="params"
              subFormFlag="Y"
              v-model:dataForm="node.params"
          />
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
