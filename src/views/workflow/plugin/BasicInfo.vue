<script setup lang="ts">
  import { computed, onMounted, ref } from "vue";
  import { dictData } from "@/api/sh_api.ts";
  import StarHorseForm from "@/components/comp/StarHorseForm.vue";
  import { flowFormFields, setFlowGroups } from "@/views/workflow/utils/FlowFormUtils.ts";
  import { useFlowDesign } from "@/store/FlowDesignStore.ts";
  import piniaInstance from "@/store";

  defineProps({
    navable: {
      type: Boolean,
      default: true
    },
    dialogFlag: {
      type: Boolean,
      default: false
    },
    readable: {
      type: Boolean,
      default: false
    }
  });
  let flowFormRef = ref();
  const flowDesign = useFlowDesign(piniaInstance);
  const formInfo = computed(() => flowDesign.flowFormInfo);
  const init = async () => {
    let data = await dictData("flow_group");
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
    getFormData
  });
</script>
<template>
  <div class="designer-wrap" v-if="!dialogFlag">
    <div class="designer-base-info">
      <div class="base-info-panel">
        <star-horse-form :field-list="flowFormFields" :outerFormData="formInfo" ref="flowFormRef" />
      </div>
    </div>
  </div>
  <star-horse-form v-else :field-list="flowFormFields" :outerFormData="formInfo" ref="flowFormRef" />
</template>
