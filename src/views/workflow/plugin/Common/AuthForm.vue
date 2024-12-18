<template>
  <div v-if="flowFormInfo.formShowType=='step'">
    <el-steps :active="flowFormStep">
      <el-step :title="name" v-for="name in flowFormInfo.bindFormName"/>
    </el-steps>
    <template v-for="(dataNo,index) in flowFormInfo.bindForm">
      <flow-form-item v-if="flowFormStep==(index+1)" :data-no="dataNo"/>
    </template>
    <el-button v-if="flowFormStep>1" @click="flowFormStep=flowFormStep-1">上一步</el-button>
    <el-button v-if="flowFormStep<flowFormInfo.bindFormName.length" @click="flowFormStep=flowFormStep+1">下一步
    </el-button>
  </div>
  <div v-if="flowFormInfo.formShowType=='tab'">
    <el-tabs v-model="flowFormTab">
      <el-tab-pane :label="name" :name="index" v-for="(name,index) in flowFormInfo.bindFormName">
        <flow-form-item :data-no="flowFormInfo.bindForm[index]"/>
      </el-tab-pane>
    </el-tabs>
  </div>
  <div v-if="flowFormInfo.formShowType=='seq'">
    <flow-form-item :data-no="dataNo" v-for="dataNo in flowFormInfo.bindForm"/>
  </div>
</template>
<script setup lang="ts">
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {computed, onMounted, ref} from "vue";
import FlowFormItem from "@/views/workflow/plugin/Common/FlowFormItem.vue";

const flowDesign = useFlowDesign(piniaInstance);
const flowFormInfo = computed(() => flowDesign.flowFormInfo);
let flowFormTab = ref<number>(0);
let flowFormStep = ref<number>(1);
const props = defineProps({
  readable: {
    type: Boolean,
    default: false,
  },
  node: {
    type: Object,
    default: function () {
      return {};
    },
  },
  value: {
    type: Array,
    default: function () {
      return [];
    },
  },
});

const init = () => {

}
onMounted(() => {
  init();
});

</script>
