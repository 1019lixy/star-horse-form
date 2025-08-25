<script setup lang="ts">
import { ref } from "vue";
import { relationDataField } from "@/views/dyform/utils/ItemPreps";

const props = defineProps<{
  visible: boolean;
  formProps: any;
}>();

const emit = defineEmits<{
  (e: "merge"): void;
  (e: "close"): void;
  (e: "reset"): void;
}>();

const dataRelationFormRef = ref<any>(null);

const dataRelationMerge = async () => {
  let flag: boolean = false;
  const formRef = dataRelationFormRef.value?.$refs.starHorseFormRef;
  await formRef.validate((res: boolean) => {
    flag = res;
  });
  if (!flag) {
    return;
  }
  const relationData = dataRelationFormRef.value.getFormData().value;
  props.formProps["dataRelation"] = relationData;
  emit("merge");
};

const dataRelationReset = () => {
  // Reset logic if needed
};

defineExpose({
  setFormData: (data: any) => {
    if (dataRelationFormRef.value) {
      dataRelationFormRef.value.setFormData(data);
    }
  }
});
</script>

<template>
  <star-horse-dialog 
    :dialogVisible="visible" 
    title="数据联动策略配置" 
    :isBatch="false"
    @merge="dataRelationMerge" 
    @closeAction="emit('close')" 
    @resetForm="dataRelationReset" 
    :selfFunc="true">
    <star-horse-form 
      primary-key="" 
      ref="dataRelationFormRef"
      :fieldList="relationDataField(formProps)" />
  </star-horse-dialog>
</template>