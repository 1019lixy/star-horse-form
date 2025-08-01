<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { dictData, piniaInstance } from 'star-horse-lowcode';
import {
  flowFormFields,
  setFlowGroups,
} from '@/views/workflow/utils/FlowFormUtils';
import { useFlowDesignStore } from '@/store/FlowDesign';

defineProps({
  navable: {
    type: Boolean,
    default: true,
  },
  dialogFlag: {
    type: Boolean,
    default: false,
  },
  readable: {
    type: Boolean,
    default: false,
  },
});
let flowFormRef = ref();
const flowDesign = useFlowDesignStore(piniaInstance);
const formInfo = computed(() => flowDesign.flowFormInfo);
const init = async () => {
  let data = await dictData('flow_group');
  setFlowGroups(data);
};
const getFormData = () => {
  return flowFormRef.value.getFormData();
};
onMounted(() => {
  init();
});
defineExpose({
  flowFormRef,
  getFormData,
});
</script>
<template>
  <div class="w-full h-full overflow-hidden" v-if="!dialogFlag">
    <div class="h-full mx-auto my-0 overflow-y-auto bg-[#f2f3f5]">
      <div class="w-[70%] my-[24px] py-[10px] mx-auto flex flex-col bg-[#fff]">
        <star-horse-form
          :field-list="flowFormFields"
          :outerFormData="formInfo"
          ref="flowFormRef"
        />
      </div>
    </div>
  </div>
  <star-horse-form
    v-else
    :field-list="flowFormFields"
    :outerFormData="formInfo"
    ref="flowFormRef"
  />
</template>
