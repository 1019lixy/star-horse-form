<template>
  <el-card class="inner_content">
    <FlowNav :currentNav="currentData" @changeFlow="changeFlow" @click="publish" @change="change"/>
    <BasicInfo ref="basicInfoRef" v-if="currentData==1"/>
    <DynamicForm ref="basicInfoRef" v-if="currentData==2"/>
    <UFlowDesign ref="flowDesignRef" :flowStyle="flowStyle" v-if="currentData==3"/>
    <FlowSetting ref="flowSettingRef" v-if="currentData==4"/>
  </el-card>
</template>
<script setup lang="ts">
import {nextTick, onMounted, ref} from "vue";
import FlowSetting from "@/views/workflow/plugin/FlowDesign/FlowSetting/index.vue"
import BasicInfo from "@/views/workflow/plugin/FlowDesign/BasicInfo/index.vue"
import FlowNav from "@/views/workflow/plugin/Common/FlowNav.vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import DynamicForm from "@/views/dyform/DynamicForm.vue";
import UFlowDesign from "@/views/workflow/formItems/UFlowDesign.vue";

const props = defineProps({
  data: {
    type: Object
  },
});
let flowStyle = ref<string>("dingding");
const flowDesign = useFlowDesign(piniaInstance);
const basicInfoRef = ref();
const flowDesignRef = ref();
const flowSettingRef = ref();
let currentData = ref<number>(1);
const changeFlow = () => {
  if (flowStyle.value == "dingding") {
    flowStyle.value = "flowable";
  } else {
    flowStyle.value = "dingding";
  }
}
/**
 * 可以使用此成熟的框架，进行更改,对于bpmn-js 可以考虑去除，太技术化不太实用
 * git clone https://gitee.com/crowncloud/smart-flow-design.git
 */
const change = async (item: any) => {
  if (currentData.value == 1) {
    let flag = false;
    await basicInfoRef.value.$refs.flowFormRef.$refs.starHorseFormRef.validate((res: boolean) => {
      flag = res;
    });
    if (!flag) {
      return;
    }
    let formData = basicInfoRef.value.$refs.flowFormRef.getFormData();
    flowDesign.flowSetFormInfo(formData);
  }
  currentData.value = item.type;
  if (currentData.value == 1) {
    let formData = flowDesign.flowFormInfo;
    await nextTick();
    basicInfoRef.value.$refs.flowFormRef.setFormData(formData.value);
  }
}
const publish = () => {

}
const init = () => {
  if (props.data) {
    flowDesign.flowSetFormInfo(props.data);
  }
}
onMounted(() => {
  init();
});
</script>


<style scoped lang="scss">

</style>
