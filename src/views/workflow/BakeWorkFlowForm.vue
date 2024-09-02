<script setup lang="ts">
import {ref} from "vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import BaseInfo from "@/views/workflow/formItems/BaseInfo.vue";
import FlowParams from "@/views/workflow/formItems/FlowParams.vue";
import FlowStatus from "@/views/workflow/formItems/FlowStatus.vue";
import FlowDesign from "@/views/workflow/formItems/UFlowDesign.vue";

let flowStyle = ref<string>("dingding");
let currentStep = ref<number>(3);
const changeDesignStyle = () => {
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
</script>

<template>
  <el-card class="inner_content">
    <div class="start-horse-workflow">
      <div class="flow-header">
        <div class="flow-step">
          <el-steps
              :align-center="true"
              :active="currentStep"
              space="30%"
              simple
          >
            <el-step title="基础信息" @click="currentStep=0">
              <template #icon>
                <star-horse-icon icon-class="add"/>
              </template>
            </el-step>
            <el-step title="流程变量" @click="currentStep=1">
              <template #icon>
                <star-horse-icon icon-class="add"/>
              </template>
            </el-step>
            <el-step title="流程状态" @click="currentStep=2">
              <template #icon>
                <star-horse-icon icon-class="add"/>
              </template>
            </el-step>
            <el-step title="流程设计" @click="currentStep=3">
              <template #icon>
                <star-horse-icon icon-class="add"/>
              </template>
            </el-step>
          </el-steps>
        </div>
        <div class="flow-button">
          <el-button text @click="changeDesignStyle">切换</el-button>
        </div>
      </div>
      <div class="flow-body">
        <base-info v-if="currentStep==0"/>
        <flow-params v-if="currentStep==1"/>
        <flow-status v-if="currentStep==2"/>
        <flow-design v-if="currentStep==3" :flowStyle="flowStyle"/>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
:deep(.el-step__icon) {
  width: unset !important;
  height: unset !important;
  font-size: unset !important;
}

:deep(.el-step__main) {
  cursor: pointer;
}

.start-horse-workflow {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .flow-header {
    position: fixed;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    vertical-align: center;
    height: 46px;
    border-bottom: 1px solid var(--star-horse-style);
    z-index: 100;

    .flow-step {
      flex: 1;
    }

    .flow-button {
      width: 25%;
    }
  }

  .flow-body {
    flex: 1;
    top: 40px;
    height: 100%;
    position: relative;
  }
}
</style>
