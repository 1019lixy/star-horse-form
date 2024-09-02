<template>
  <el-card class="inner_content">
    <FlowNav :currentNav="currentData.value" @click="publish" @change="change"/>
    <BasicInfo ref="basicInfoRef" v-if="currentData.value==1"/>
    <FlowDesign ref="flowDesignRef" v-if="currentData.value==3"/>
    <FlowSetting ref="flowSettingRef" v-if="currentData.value==4"/>
  </el-card>
</template>
<script setup lang="ts">
import {ref} from "vue";
import FlowDesign from "@/views/workflow/plugin/FlowDesign/index.vue"
import FlowSetting from "@/views/workflow/plugin/FlowDesign/FlowSetting/index.vue"
import BasicInfo from "@/views/workflow/plugin/FlowDesign/BasicInfo/index.vue"
import FlowNav from "@/views/workflow/plugin/Common/FlowNav.vue";

// let flowStyle = ref<string>("dingding");
// let currentStep = ref<number>(3);
const basicInfoRef = ref();
const flowDesignRef = ref();
const flowSettingRef = ref();
let currentData = ref<any>({
  name: '流程设计',
  shortName: '流程',
  value: 3,
  path: '/flowDesign',
});
// const changeDesignStyle = () => {
//   if (flowStyle.value == "dingding") {
//     flowStyle.value = "flowable";
//   } else {
//     flowStyle.value = "dingding";
//   }
// }
/**
 * 可以使用此成熟的框架，进行更改,对于bpmn-js 可以考虑去除，太技术化不太实用
 * git clone https://gitee.com/crowncloud/smart-flow-design.git
 */
const change = (item: any) => {
  currentData.value = item;
}
const publish = () => {

}
</script>


<style scoped lang="scss">

</style>
