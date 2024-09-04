<script setup lang="ts">
import {onMounted, ref} from "vue";
import {dictData} from "@/api/sh_api.ts";
import StarHorseForm from "@/components/comp/StarHorseForm.vue";
import {flowFormFields, setFlowGroups} from "@/views/workflow/utils/FlowFormUtils.ts";

defineProps({
  navable: {
    type: Boolean,
    default: true,
  },
  readable: {
    type: Boolean,
    default: false,
  },
});
let flowFormRef = ref();
const init = async () => {
  let data = await dictData("flow_group");
  setFlowGroups(data);
}
onMounted(() => {
  init();
});
</script>
<template>
  <div class="designer-wrap">
    <div class="designer-base-info">
      <div class="base-info-panel">
        <star-horse-form :field-list="flowFormFields" ref="flowFormRef"/>
      </div>
    </div>
  </div>
</template>
