<script setup lang="ts">
import JbpmDesign from "@/views/jbpm/JbpmDesign.vue";
import FlowDesign from "@/views/workflow/plugin/FlowDesign/index.vue"

const props = defineProps({
  flowStyle: {type: String, default: "flowable"}
});
</script>

<template>
  <div class="flow-design">
    <div class="design-area">
      <jbpm-design v-if="flowStyle=='flowable'"/>
      <FlowDesign v-if="flowStyle=='dingding'"/>
    </div>

  </div>

</template>

<style scoped lang="scss">
.flow-design {
  height: 100%;
  display: flex;
  width: 100%;
  flex: 1;
  overflow: hidden;

  .design-area {
    flex: 1;
    overflow: hidden;
    position: relative;
    height: 100%;
  }

  .preps-area {
    margin-left: 10px;
    width: 25%;
  }

}

</style>
