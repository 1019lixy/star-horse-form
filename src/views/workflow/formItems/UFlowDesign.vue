<script setup lang="ts">
import FlowDesign from "@/views/workflow/plugin/FlowDesign.vue";

const props = defineProps({
  flowStyle: { type: String, default: "dingding" },
  stopInitFormInfo: { type: Boolean, default: false },
});
</script>

<template>
  <div class="sh-flow-editor">
    <div class="design-area">
      <jbpm-design v-if="flowStyle == 'flowable'" />
      <FlowDesign
        v-if="flowStyle == 'dingding'"
        :saveBtnVisible="false"
        :stopInitFormInfo="stopInitFormInfo"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.sh-flow-editor {
  height: 100%;
  display: flex;
  position: relative;
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
